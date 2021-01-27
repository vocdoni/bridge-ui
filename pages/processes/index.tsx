import { useContext, Component, ReactNode, useState, useEffect } from 'react'
import { VotingApi, ProcessContractParameters, CensusErc20Api, DigestedProcessResults, ProcessMetadata, DigestedProcessResultItem, ProcessStatus, GatewayPool } from 'dvote-js'
import { ProcessInfo, TokenInfo } from "../../lib/types"
import Router from 'next/router'
import Spinner from "react-svg-spinner"

import { Button } from '@aragon/ui'
import { strDateDiff } from '../../lib/date'
import { HEX_REGEX } from '../../lib/regex'
import { allTokens } from '../../lib/tokens'
import { BigNumber, providers } from 'ethers'
import { areAllNumbers } from '../../lib/util'
import { WalletStatus } from '../../components/wallet-status'
import TokenAmount from "token-amount"
import { useWallet } from 'use-wallet'
import { useProcess } from '../../lib/hooks/processes'
import { useUrlHash } from '../../lib/hooks/url-hash'
import { useToken } from '../../lib/hooks/tokens'
import { usePool } from '../../lib/hooks/pool'
import { useSigner } from '../../lib/hooks/signer'

const BN_ZERO = BigNumber.from(0)

// MAIN COMPONENT
const ProcessPage = props => {
    const wallet = useWallet()
    const signer = useSigner()
    const { poolPromise } = usePool()
    const processId = useUrlHash().substr(2)
    const proc = useProcess(processId)
    const token = useToken(proc?.tokenAddress)
    const [tokenRegistered, setTokenRegistered] = useState(null)
    const [startDate, setStartDate] = useState(null as Date)
    const [endDate, setEndDate] = useState(null as Date)
    const [censusProof, setCensusProof] = useState(null as { key: string, proof: string[], value: string })
    const [hasVoted, setHasVoted] = useState(false)
    const [refreshingVotedStatus, setRefreshingVotedStatus] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [choices, setChoices] = useState([] as number[])
    const [results, setResults] = useState(null as DigestedProcessResults)

    const nullifier = VotingApi.getSignedVoteNullifier(wallet.account, processId)

    if (!processId.match(HEX_REGEX)) {
        console.error("Invalid process ID", processId)
        Router.replace('/tokens')
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

    // Dates
    useEffect(() => {
        if (!proc?.parameters?.startBlock) return

        poolPromise
            .then(pool => Promise.all([
                VotingApi.estimateDateAtBlock(proc.parameters.startBlock, pool),
                VotingApi.estimateDateAtBlock(proc.parameters.startBlock + proc.parameters.blockCount, pool)
            ])).then(([startDate, endDate]) => {
                setStartDate(startDate)
                setEndDate(endDate)
            }).catch(err => {
                console.error(err)
            })
    }, [poolPromise, proc?.parameters?.startBlock])

    // Census Proof
    useEffect(() => {
        let skip = false;

        (async () => {
            const pool = await poolPromise

            if (!await CensusErc20Api.isRegistered(token.address, pool)) {
                setTokenRegistered(false)
                return alert("The token contract is not yet registered")
            }
            if (skip) return
            else if (!tokenRegistered !== true) setTokenRegistered(true)

            const processEthCreationBlock = proc.parameters.evmBlockHeight
            const balanceSlot = CensusErc20Api.getHolderBalanceSlot(wallet.account, token.balanceMappingPosition)

            const proofFields = await CensusErc20Api.generateProof(token.address, [balanceSlot], processEthCreationBlock, pool.provider as providers.JsonRpcProvider)
            if (skip) return
            setCensusProof(proofFields.proof.storageProof[0])
        })()

        return () => { skip = true }
    }, [wallet.account, token?.address, processId, nullifier])

    // Loaders
    const updateVoteStatus = () => {
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
        poolPromise
            .then(pool => VotingApi.getResultsDigest(processId, pool))
            .then((results) => setResults(results))
            .catch(err => console.error(err))
    }


    // Callbacks
    const onSelect = (questionIdx: number, choiceValue: number) => {
        if (typeof choiceValue == "string") choiceValue = parseInt(choiceValue)
        if (isNaN(choiceValue)) return alert("Invalid question value")

        choices[questionIdx] = choiceValue
        setChoices(choices)
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
                const { envelope, signature } = await VotingApi.packageSignedEnvelope({
                    votes: choices,
                    censusOrigin: proc.parameters.censusOrigin,
                    censusProof: proof.storageProof[0],
                    processId,
                    walletOrSigner: signer,
                    processKeys: keys
                })
                await VotingApi.submitEnvelope(envelope, signature, pool)
            } else {
                const { envelope, signature } = await VotingApi.packageSignedEnvelope({
                    votes: choices,
                    censusOrigin: proc.parameters.censusOrigin,
                    censusProof: proof.storageProof[0],
                    processId,
                    walletOrSigner: signer
                })
                await VotingApi.submitEnvelope(envelope, signature, pool)
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

            alert("Your vote has been sucessfully submitted")
            setIsSubmitting(false)
        }
        catch (err) {
            console.error(err)
            setIsSubmitting(false)
            alert("The delivery of your vote could not be completed")
        }
    }

    // Render params

    const hasStarted = startDate && startDate.getTime() <= Date.now()
    const hasEnded = endDate && endDate.getTime() < Date.now()
    const isInCensus = !!censusProof

    const canVote = proc && isInCensus && tokenRegistered === true && !hasVoted && hasStarted && !hasEnded

    const remainingTime = startDate ?
        (hasStarted ?
            strDateDiff("end-date", endDate) :
            strDateDiff("start-date", startDate)) : ""

    let status: string = ""

    switch (proc.parameters.status.value) {
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
                    renderQuestionRow(qIdx, question, results, token, canVote, onSelect)
                )
            }
        </div>

        <br /><br />

        <div className="row-continue">
            {(() => {
                if (!processId || !proc) return <></>

                const allQuestionsChosen = areAllNumbers(choices) && choices.length == proc.metadata.questions.length

                const hasStarted = startDate && startDate.getTime() <= Date.now()
                const hasEnded = endDate && endDate.getTime() < Date.now()

                if (!proc) return null
                else if (hasVoted) return <p className="status">Your vote has been registered</p>
                else if (!hasStarted) return <p className="status">The process has not started yet</p>
                else if (hasEnded) return <p className="status">The process has ended</p>
                else if (!censusProof) return <p className="status">You are not part of the process holders' census</p>
                else if (!allQuestionsChosen) return <p className="status">Select a choice for every question</p>

                if (isSubmitting || refreshingVotedStatus) return <p className="status">Please wait...<Spinner /></p>

                return <Button mode="strong" onClick={() => onSubmitVote()}>Sign and submit the vote</Button>
            })()}
        </div>
    </div>
}

function renderQuestionRow(qIdx: number, question: ProcessMetadata["questions"][0], results: DigestedProcessResults, token: TokenInfo, canVote: boolean, onSelect: (qIdx: number, choiceValue: number) => any) {
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
                question.choices.map((choice, cIdx) =>
                    canVote ?
                        renderClickableChoice(qIdx, cIdx, choice.title.default, choice.value, onSelect) :
                        results?.questions?.length ?
                            renderResultsChoice(cIdx, resultsQuestion, questionVoteCount, token) :
                            renderReadOnlyChoice(cIdx, choice.title.default)
                )
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

function renderResultsChoice(cIdx: number, resultsQuestion: DigestedProcessResultItem, totalVotes: BigNumber, token: TokenInfo) {
    if (!resultsQuestion || !resultsQuestion.voteResults || !resultsQuestion.voteResults[cIdx]) return null

    const title = resultsQuestion.voteResults[cIdx].title.default
    const voteCount = resultsQuestion.voteResults[cIdx].votes || BN_ZERO
    const percent = voteCount.mul(1000).div(totalVotes).toNumber() / 10 // = voteCount / totalVotes * 100
    const amount = new TokenAmount(voteCount, token.decimals, { symbol: token.symbol }).format()

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

export default ProcessPage