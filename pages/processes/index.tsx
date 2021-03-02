import { useState, useEffect } from 'react'
import { VotingApi, CensusErc20Api, DigestedProcessResults, ProcessMetadata, DigestedProcessResultItem, ProcessStatus } from 'dvote-js'
import { TokenInfo } from "../../lib/types"
import { withRouter, useRouter } from 'next/router'
import Spinner from "react-svg-spinner"

import { usePool, useProcess, useSigner } from '@vocdoni/react-hooks'
import { Button } from '@aragon/ui'
import { strDateDiff } from '../../lib/date'
import { HEX_REGEX } from '../../lib/regex'
import { BigNumber, providers } from 'ethers'
import { areAllNumbers } from '../../lib/util'
import { WalletStatus } from '../../components/wallet-status'
import TokenAmount from "token-amount"
import { useWallet } from 'use-wallet'
import { useUrlHash } from 'use-url-hash'
import { useToken } from '../../lib/hooks/tokens'
import { useMessageAlert } from '../../lib/hooks/message-alert'

const BN_ZERO = BigNumber.from(0)

// MAIN COMPONENT
const ProcessPage = props => {
    const router = useRouter()
    const wallet = useWallet()
    const signer = useSigner()
    const { setAlertMessage } = useMessageAlert()
    const { poolPromise } = usePool()
    const processId = useUrlHash().substr(1)
    const { process: proc } = useProcess(processId)
    const token = useToken(proc?.entity)
    const [tokenRegistered, setTokenRegistered] = useState(null)
    const [startDate, setStartDate] = useState(null as Date)
    const [endDate, setEndDate] = useState(null as Date)
    const [censusProof, setCensusProof] = useState(null as { key: string, proof: string[], value: string })
    const [hasVoted, setHasVoted] = useState(false)
    const [refreshingVotedStatus, setRefreshingVotedStatus] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [choices, setChoices] = useState([] as number[])
    const [results, setResults] = useState(null as DigestedProcessResults)

    const nullifier = VotingApi.getSignedVoteNullifier(wallet?.account || "", processId)

    if (typeof window != "undefined" && !processId.match(HEX_REGEX)) {
        console.error("Invalid process ID", processId)
        router.replace('/tokens')
    }

    // Effects

    useEffect(() => {
        let skip = false

        const refreshInterval = setInterval(() => {
            if (skip) return

            Promise.all([
                updateVoteStatus(),
                updateResults()
            ]).catch(err => console.error(err))
        }, 1000 * 20)

        return () => {
            skip = true
            clearInterval(refreshInterval)
        }
    }, [processId])

    // Vote results
    useEffect(() => { updateResults() }, [processId])

    // Vote status
    useEffect(() => { updateVoteStatus() }, [wallet, nullifier])

    // Census status
    useEffect(() => { updateCensusStatus() }, [wallet, nullifier, token?.address])

    // Dates
    useEffect(() => { updateDates() }, [proc?.parameters?.startBlock])

    // Loaders
    const updateVoteStatus = () => {
        if (!processId || !nullifier) return
        setRefreshingVotedStatus(true)

        poolPromise
            .then(pool => VotingApi.getEnvelopeStatus(processId, nullifier, pool))
            .then(({ registered }) => {
                setRefreshingVotedStatus(false)
                setHasVoted(registered)
            })
            .catch(err => {
                setRefreshingVotedStatus(false)
                console.error(err)
            })
    }
    const updateResults = () => {
        if (!processId) return

        poolPromise
            .then(pool => VotingApi.getResultsDigest(processId, pool))
            .then((results) => setResults(results))
            .catch(err => console.error(err))
    }
    const updateCensusStatus = async () => {
        if (!token?.address) {
            setTokenRegistered(false)
            return
        }
        else if (!wallet?.account) {
            setCensusProof(null)
            return
        }

        const pool = await poolPromise

        if (!await CensusErc20Api.isRegistered(token.address, pool)) {
            setTokenRegistered(false)
            return setAlertMessage("The token contract is not yet registered")
        }
        else if (tokenRegistered !== true) setTokenRegistered(true)

        const processEthCreationBlock = proc.parameters.evmBlockHeight
        const balanceSlot = CensusErc20Api.getHolderBalanceSlot(wallet.account, token.balanceMappingPosition)

        const proofFields = await CensusErc20Api.generateProof(token.address, [balanceSlot], processEthCreationBlock, pool.provider as providers.JsonRpcProvider)

        setCensusProof(proofFields.proof.storageProof[0])
    }
    const updateDates = () => {
        if (!proc?.parameters?.startBlock) return

        return poolPromise
            .then(pool => Promise.all([
                VotingApi.estimateDateAtBlock(proc.parameters.startBlock, pool),
                VotingApi.estimateDateAtBlock(proc.parameters.startBlock + proc.parameters.blockCount, pool)
            ])).then(([startDate, endDate]) => {
                setStartDate(startDate)
                setEndDate(endDate)
            }).catch(err => {
                console.error(err)
            })
    }


    // Callbacks
    const onSelect = (questionIdx: number, choiceValue: number) => {
        if (typeof choiceValue == "string") choiceValue = parseInt(choiceValue)
        if (isNaN(choiceValue)) return setAlertMessage("Invalid question value")

        choices[questionIdx] = choiceValue
        setChoices([].concat(choices))
    }

    const onSubmitVote: () => Promise<void> = async () => {
        if (!confirm("You are about to submit your vote. This action cannot be undone.\n\nDo you want to continue?")) return

        try {
            setIsSubmitting(true)

            const pool = await poolPromise

            // Census Proof
            const holderAddr = wallet.account
            const processEthCreationBlock = proc.parameters.evmBlockHeight
            const balanceSlot = CensusErc20Api.getHolderBalanceSlot(holderAddr, token.balanceMappingPosition)
            const { proof } = await CensusErc20Api.generateProof(token.address, [balanceSlot], processEthCreationBlock, pool.provider as providers.JsonRpcProvider)

            // Detect encryption
            if (proc.parameters.envelopeType.hasEncryptedVotes) {
                const keys = await VotingApi.getProcessKeys(processId, pool)
                const envelope = await VotingApi.packageSignedEnvelope({
                    votes: choices,
                    censusOrigin: proc.parameters.censusOrigin,
                    censusProof: proof.storageProof[0],
                    processId,
                    walletOrSigner: signer,
                    processKeys: keys
                })
                await VotingApi.submitEnvelope(envelope, signer, pool)
            } else {
                const envelope = await VotingApi.packageSignedEnvelope({
                    votes: choices,
                    censusOrigin: proc.parameters.censusOrigin,
                    censusProof: proof.storageProof[0],
                    processId,
                    walletOrSigner: signer
                })
                await VotingApi.submitEnvelope(envelope, signer, pool)
            }

            // wait a block
            await new Promise(resolve => setTimeout(resolve, Math.floor(parseInt(process.env.BLOCK_TIME) * 1000 * 1.2)))

            let voted = false
            for (let i = 0; i < 10; i++) {
                const { registered, date } = await VotingApi.getEnvelopeStatus(processId, nullifier, pool)
                voted = registered
                setHasVoted(voted)

                if (registered) break
                await new Promise(resolve => setTimeout(resolve, Math.floor(parseInt(process.env.BLOCK_TIME) * 500)))
            }
            if (!voted) throw new Error('The vote has not been registered')

            // detached update
            setTimeout(() => {
                updateResults()
                updateVoteStatus()
            })

            setAlertMessage("Your vote has been sucessfully submitted")
            setIsSubmitting(false)
        }
        catch (err) {
            console.error(err)
            setIsSubmitting(false)
            setAlertMessage("The delivery of your vote could not be completed")
        }
    }

    // Render params

    const allQuestionsChosen = areAllNumbers(choices) && choices.length == proc?.metadata?.questions?.length
    const hasStarted = startDate && startDate.getTime() <= Date.now()
    const hasEnded = endDate && endDate.getTime() < Date.now()
    const isInCensus = !!censusProof

    const canVote = proc && isInCensus && tokenRegistered === true && !hasVoted && hasStarted && !hasEnded

    const remainingTime = startDate ?
        (hasStarted ?
            strDateDiff("end-date", endDate) :
            strDateDiff("start-date", startDate)) : ""

    let status: string = ""

    switch (proc?.parameters.status.value) {
        case ProcessStatus.READY:
            if (hasEnded)
                status = "The process is closed"
            else if (hasStarted)
                status = "The process is open for voting"
            else if (!hasStarted)
                status = "The process is ready and will start soon"
            break
        case ProcessStatus.PAUSED:
            status = "The process is paused"
            break
        case ProcessStatus.CANCELED:
            status = "The process has been canceled"
            break
        case ProcessStatus.ENDED:
        case ProcessStatus.RESULTS:
            status = "The process has ended"
            break
    }

    if (!processId || !proc) return renderEmpty()


    return <div id="process">
        <div className="page-head">
            <div className="left">
                <h1>{token?.symbol || "Token"} governance process</h1>
                <h4 className="accent-1">Cast your vote and see the ongoing results as they are received.</h4>
            </div>
            <div className="right">
                <WalletStatus />
            </div>
        </div>

        <div className="row-description">
            <div className="left">
                <h2>{proc.metadata.title.default || "No title"}</h2>
                <h4 className="accent-1">{status}</h4>
                <p className="light">{proc.metadata.description.default || "No description"}</p>
            </div>
            <div className="right">
                <p className="light">{remainingTime}</p>
            </div>
        </div>

        <div className="row-questions">
            {
                proc.metadata.questions.map((question, qIdx) =>
                    renderQuestionRow(qIdx, question, results, token, canVote, hasVoted, !!wallet?.account, onSelect)
                )
            }
        </div>

        <br /><br />

        <div className="row-continue">
            {(() => {
                if (!processId || !proc) return <></>
                else if (hasVoted) return <p className="status">Your vote has been registered</p>
                else if (!hasStarted) return <p className="status">The process has not started yet</p>
                else if (hasEnded) return <p className="status">The process has ended</p>
                else if (!wallet?.account) return <p className="status">You are not connected to MetaMask</p>
                else if (!censusProof) return <p className="status">You are not part of the process holders' census</p>
                else if (!allQuestionsChosen) return <p className="status">Select a choice for every question</p>
                else if (isSubmitting || refreshingVotedStatus) return <p className="status">Please wait...<Spinner /></p>

                return <Button mode="strong" onClick={onSubmitVote}>Sign and submit the vote</Button>
            })()}
        </div>
    </div>
}

function renderQuestionRow(qIdx: number, question: ProcessMetadata["questions"][0], results: DigestedProcessResults, token: TokenInfo, canVote: boolean, hasVoted: boolean, hasWallet: boolean, onSelect: (qIdx: number, choiceValue: number) => any) {
    const resultsQuestion = results && results.questions[qIdx]

    const questionVoteCount = resultsQuestion &&
        resultsQuestion.voteResults.reduce((prev, cur) => prev.add(cur.votes || BN_ZERO), BN_ZERO)
        || BN_ZERO

    return <div className="question" key={qIdx}>
        <div className="left">
            <h6 className="accent-1">Question {qIdx + 1}</h6>
            <h3>{question.title.default || "No title"}</h3>
            <p className="light">{question.description.default || "No description"}</p>
        </div>
        <div className="right">
            {
                (() => {
                    if (!hasWallet || hasVoted) {
                        if (results?.questions?.length) return question.choices.map((choice, cIdx) => renderChoiceResults(cIdx, resultsQuestion, questionVoteCount, token))
                        else return question.choices.map((choice, cIdx) => renderReadOnlyChoice(cIdx, choice.title.default))
                    } else if (canVote) {
                        return question.choices.map((choice, cIdx) => renderClickableChoice(qIdx, cIdx, choice.title.default, choice.value, onSelect))
                    } else {
                        return question.choices.map((choice, cIdx) => renderReadOnlyChoice(cIdx, choice.title.default))
                    }
                })()
            }
        </div>
    </div>
}

function renderClickableChoice(questionIdx: number, choiceIdx: number, title: string, choiceValue: number, onSelect: (qIdx: number, choiceValue: number) => any) {
    return <label className="radio-choice" key={choiceIdx}> <input type="radio" onClick={() => onSelect(questionIdx, choiceValue)} name={"question-" + questionIdx} />
        <div className="checkmark"></div> {title}
    </label>
}

function renderReadOnlyChoice(choiceIdx: number, title: string) {
    return <label className="radio-choice" key={choiceIdx}> <input type="radio" checked={false} />
        <div className="checkmark"></div> {title}
    </label>
}

function renderChoiceResults(cIdx: number, resultsQuestion: DigestedProcessResultItem, totalVotes: BigNumber, token: TokenInfo) {
    if (!resultsQuestion || !resultsQuestion.voteResults || !resultsQuestion.voteResults[cIdx]) return null

    const title = resultsQuestion.voteResults[cIdx].title.default
    const voteCount = resultsQuestion.voteResults[cIdx].votes || BN_ZERO
    const percent = totalVotes.isZero() ? 0 :    // = voteCount / totalVotes * 100
        Math.round(voteCount.mul(10000).div(totalVotes).toNumber()) / 100
    const amount = token ?
        new TokenAmount(voteCount, token.decimals, { symbol: token.symbol }).format() : ""

    return <div className="choice-result" key={cIdx}>
        <div className="percent">
            <div className="box">{percent.toFixed(1)} %</div>
        </div>
        <div className="text">
            <span>{title}</span>
            <span className="lighter">{amount} votes</span>
        </div>
    </div>
}

// TODO:
function renderEmpty() {
    return <div>
        <br />
        <p>Loading... <Spinner /></p>
    </div>
}

export default withRouter(ProcessPage)
