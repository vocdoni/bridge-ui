import { useContext, Component, ReactNode } from 'react'
import Link from 'next/link'
import { VotingApi, ProcessContractParameters, CensusErc20Api, DigestedProcessResults, ProcessMetadata, DigestedProcessResultItem } from 'dvote-js'
import { ensureConnectedVochain, getProcessInfo } from '../../lib/api'
import { ProcessInfo } from "../../lib/types"
// import { message, Button, Spin, Divider, Input, Select, Col, Row, Card, Modal } from 'antd'
// import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
// import { getEntityId } from 'dvote-js/dist/api/entity'
import Router from 'next/router'
import Spinner from "react-svg-spinner"

// import { getGatewayClients, getNetworkState } from '../../lib/network'
import AppContext, { IAppContext } from '../../lib/app-context'
import Button from '../../components/button'
import { getPool } from '../../lib/vochain'
import { strDateDiff } from '../../lib/date'
import { HEX_REGEX } from '../../lib/regex'
import { allTokens } from '../../lib/tokens'
import { providers } from 'ethers'
import { areAllNumbers } from '../../lib/util'
import { connectWeb3, getWeb3, isWeb3Ready } from '../../lib/web3'
import { WalletStatus } from '../../components/wallet-status'

// MAIN COMPONENT
const ProcessPage = props => {
    // Get the global context and pass it to our stateful component
    const context = useContext(AppContext)

    return <ProcessView {...context} />
}

type State = {
    entityLoading?: boolean,
    process: ProcessInfo,
    startDate: Date,
    endDate: Date,
    currentBlock: number,
    // currentDate: Date,
    censusProof: {
        key: string;
        proof: string[];
        value: string;
    },
    hasVoted: boolean,
    hasVotedOnDate: Date,
    showConfirmChoices: boolean,
    showSubmitConfirmation: boolean,
    isSubmitting: boolean,
    refreshingVoteStatus: boolean,
    nullifier: string,
    connectionError?: string,
    choices: number[],
    results: DigestedProcessResults
}

// Stateful component
class ProcessView extends Component<IAppContext, State> {
    state: State = {
        process: null,
        startDate: null,
        endDate: null,
        currentBlock: null,
        censusProof: null,
        hasVoted: false,
        hasVotedOnDate: null,
        showConfirmChoices: false,
        showSubmitConfirmation: false,

        choices: [],
        results: null,
        isSubmitting: false,
        refreshingVoteStatus: false,
        nullifier: ''
    }

    refreshInterval = null

    componentDidMount() {
        const processId = this.resolveProcessId()
        if (!processId.match(HEX_REGEX)) {
            Router.replace('/')
            return
        }

        return Promise.all([
            this.refreshBlockHeight(),
            getProcessInfo(processId),
            this.refreshVoteResults()
        ]).then((results) => {
            const proc = results[1]
            this.setState({ process: proc })

            return Promise.all([
                this.estimateDates(proc.parameters),
                this.refreshVoteState(proc)
            ])
        }).then(() => {
            if (!this.state.hasVoted) {
                const interval = (parseInt(process.env.BLOCK_TIME || '10', 10) || 10) * 1000
                this.refreshInterval = setInterval(
                    () => this.refreshBlockHeight(),
                    interval
                )
            }
        }).catch(err => console.error(err))
    }

    componentWillUnmount() {
        clearInterval(this.refreshInterval)
    }

    refreshBlockHeight() {
        return ensureConnectedVochain()
            .then(() => VotingApi.getBlockHeight(getPool()))
            .then(height => {
                this.setState({ currentBlock: height })
            })
    }

    async refreshVoteState(proc: ProcessInfo) {
        try {
            if (!isWeb3Ready()) { await connectWeb3() }
            if (!isWeb3Ready()) return

            const pool = getPool()
            const holderAddr = await getWeb3().signer.getAddress()
            this.setState({ refreshingVoteStatus: true })
            const token = allTokens.find(t => t.address.toLowerCase() == this.state.process.parameters.entityAddress.toLowerCase())

            if (!token || !await CensusErc20Api.isRegistered(token.address, pool)) {
                alert("The token contract is not yet registered")
                return
            }

            const processEthCreationBlock = proc.parameters.evmBlockHeight
            const balanceSlot = CensusErc20Api.getHolderBalanceSlot(holderAddr, token.balanceMappingPosition)

            const proofFields = await CensusErc20Api.generateProof(token.address, [balanceSlot], processEthCreationBlock, pool.provider as providers.JsonRpcProvider)
            const { proof, block, blockHeaderRLP, accountProofRLP, storageProofsRLP } = proofFields
            this.setState({ censusProof: proof.storageProof[0] })

            const nullifier = VotingApi.getSignedVoteNullifier(holderAddr, proc.id)
            const { registered, date } = await VotingApi.getEnvelopeStatus(proc.id, nullifier, pool)

            this.setState({
                refreshingVoteStatus: false,
                nullifier: nullifier.replace(/^0x/, ''),
                hasVoted: registered,
                hasVotedOnDate: date || null,
            })
        }
        catch (err) {
            this.setState({
                refreshingVoteStatus: false,
            })
        }
    }

    async refreshVoteResults() {
        await ensureConnectedVochain()

        const processId = this.resolveProcessId()
        const pool = getPool()

        // return VotingApi.getRawResults(processId, pool).then(console.log)
        return VotingApi.getResultsDigest(processId, pool).then(results => {
            this.setState({ results })
        }).catch(console.error)
    }

    estimateDates(proc: ProcessContractParameters) {
        return Promise.all([
            VotingApi.estimateDateAtBlock(proc.startBlock, getPool()),
            VotingApi.estimateDateAtBlock(proc.startBlock + proc.blockCount, getPool()),
        ]).then(dates => {
            this.setState({ startDate: dates[0], endDate: dates[1] })
        })
    }

    resolveProcessId(): string {
        if (typeof window != "undefined") return location.hash.substr(2)
        else if (this.props.urlHash) return this.props.urlHash
        else return ""
    }

    async onSubmitVote(): Promise<void> {
        if (!confirm("You are about to submit your vote. This action cannot be undone.\n\nDo you want to continue?")) return

        const votes = this.state.choices
        const proc = this.state.process
        const pool = getPool()

        try {
            this.setState({ isSubmitting: true })
            if (!isWeb3Ready()) { await connectWeb3() }
            if (!isWeb3Ready()) return alert("Please, install Metamask and grant access to the Bridge dapp")

            // Merkle Proof
            const holderAddr = await getWeb3().signer.getAddress()
            const token = allTokens.find(t => t.address.toLowerCase() == this.state.process.parameters.entityAddress.toLowerCase())
            const processEthCreationBlock = proc.parameters.evmBlockHeight
            const balanceSlot = CensusErc20Api.getHolderBalanceSlot(holderAddr, token.balanceMappingPosition)
            const { proof } = await CensusErc20Api.generateProof(token.address, [balanceSlot], processEthCreationBlock, pool.provider as providers.JsonRpcProvider)

            // Detect encryption
            if (proc.parameters.envelopeType.hasEncryptedVotes) {
                const keys = await VotingApi.getProcessKeys(proc.id, pool)
                const { envelope, signature } = await VotingApi.packageSignedEnvelope({
                    votes,
                    censusOrigin: proc.parameters.censusOrigin,
                    censusProof: proof.storageProof[0],
                    processId: proc.id,
                    walletOrSigner: getWeb3().signer,
                    processKeys: keys
                })
                await VotingApi.submitEnvelope(envelope, signature, pool)
            } else {
                const { envelope, signature } = await VotingApi.packageSignedEnvelope({
                    votes,
                    censusOrigin: proc.parameters.censusOrigin,
                    censusProof: proof.storageProof[0],
                    processId: proc.id,
                    walletOrSigner: getWeb3().signer
                })
                await VotingApi.submitEnvelope(envelope, signature, pool)
            }

            // wait a bit
            await new Promise(resolve => setTimeout(resolve, Math.floor(parseInt(process.env.BLOCK_TIME) * 1000)))

            for (let i = 0; i < 10; i++) {
                const nullifier = VotingApi.getSignedVoteNullifier(await getWeb3().signer.getAddress(), proc.id)
                const { registered, date } = await VotingApi.getEnvelopeStatus(proc.id, nullifier, pool)
                this.setState({
                    nullifier: nullifier.replace(/^0x/, ''),
                    hasVoted: registered,
                    hasVotedOnDate: date || null,
                })

                if (registered) break
                await new Promise(resolve => setTimeout(resolve, Math.floor(parseInt(process.env.BLOCK_TIME) * 500)))
            }
            if (!this.state.hasVoted) throw new Error('The vote has not been registered')

            // detached update
            setTimeout(() =>
                this.refreshVoteResults()
                    .then(() => this.refreshVoteState(proc)).catch(),
                1000 * 16)
            clearInterval(this.refreshInterval)

            alert("Your vote has been sucessfully submitted")
            this.setState({ isSubmitting: false })
        }
        catch (err) {
            console.error(err)
            this.setState({ isSubmitting: false })
            alert("The delivery of your vote could not be completed")
        }
    }

    canVote(): boolean {
        if (!this.state.process) return false
        else if (!this.state.process || !this.state.process.parameters.status.isReady) return false
        else if (this.state.hasVoted) return false
        // else if(this.state.isSubmitting) return false
        else if (!this.state.startDate || this.state.startDate.getTime() >= Date.now()) return false
        else if (!this.state.endDate || this.state.endDate.getTime() < Date.now()) return false
        else if (!this.state.censusProof) return false
        return true
    }

    shouldDisplayResults(): boolean {
        if (this.state.process.parameters.status.isEnded || this.state.process.parameters.status.hasResults) return true
        else if (this.state.endDate && this.state.endDate.getTime() < Date.now()) return true
        else if (this.state.hasVoted && this.state.results && this.state.results.questions && this.state.results.questions.length) return true
        return false
    }

    setQuestionChoice(questionIdx: number, choiceValue: number) {
        if (typeof choiceValue == "string") choiceValue = parseInt(choiceValue)
        if (isNaN(choiceValue)) return alert("Invalid question value")

        const choices = [].concat(this.state.choices)
        choices[questionIdx] = choiceValue
        this.setState({ choices })
    }

    renderEmpty() {
        // TODO:
        return <div>
            <p>Loading... <Spinner /></p>
        </div>
    }

    renderStatusFooter() {
        const { choices, startDate, endDate, hasVoted, refreshingVoteStatus, isSubmitting, censusProof } = this.state
        const processId = this.resolveProcessId()
        if (!processId) return this.renderEmpty()

        const proc = this.state.process
        if (!proc) return this.renderEmpty()

        const allQuestionsChosen = areAllNumbers(choices) && choices.length == proc.metadata.questions.length

        const hasStarted = startDate && startDate.getTime() <= Date.now()
        const hasEnded = endDate && endDate.getTime() < Date.now()

        // const canVote = !hasVoted && hasStarted && !hasEnded && isInCensus

        if (!proc || refreshingVoteStatus) return null
        else if (hasVoted) return <p className="status">Your vote has been registered</p>
        else if (!hasStarted) return <p className="status">The process has not started yet</p>
        else if (hasEnded) return <p className="status">The process has ended</p>
        else if (!censusProof) return <p className="status">You are not part of the process holders' census</p>
        else if (!allQuestionsChosen) return <p className="status">Select a choice for every question</p>

        if (isSubmitting) return <p className="status">Please wait...<Spinner /></p>

        return <Button onClick={() => this.onSubmitVote()}>Sign and submit the vote</Button>
    }

    render() {
        const { holderAddress } = this.props
        const { startDate, endDate, hasVoted } = this.state
        const processId = this.resolveProcessId()
        if (!processId) return this.renderEmpty()

        const proc = this.state.process
        if (!proc) return this.renderEmpty()

        const hasStarted = startDate && startDate.getTime() <= Date.now()
        // const hasEnded = endDate && endDate.getTime() < Date.now()
        // const isInCensus = !!this.state.censusProof

        const remainingTime = this.state.startDate ?
            (hasStarted ?
                strDateDiff("end-date", this.state.endDate) :
                strDateDiff("start-date", this.state.startDate)) : ""

        const status = "The process is open for voting"
        const choiceVoteCount = Math.round(Math.random() * 100)
        const questionVoteCount = 100

        return <div id="process">
            <div className="page-head">
                <div className="left">
                    <h1>{proc.token.symbol} governance process</h1>
                    <h4 className="accent-1">Cast your vote and see the ongoing results as they are received.</h4>
                </div>
                <div className="right">
                    <WalletStatus address={holderAddress} />
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
                        this.renderQuestionRow(qIdx)
                    )
                }
            </div>

            <br /><br />

            <div className="row-continue">
                {this.renderStatusFooter()}
            </div>
        </div>
    }

    renderQuestionRow(qIdx: number) {
        const question = this.state.process.metadata.questions[qIdx]
        const resultsQuestion = this.state.results &&
            this.state.results.questions[qIdx]

        const questionVoteCount = resultsQuestion &&
            resultsQuestion.voteResults.reduce((prev, cur) => prev + (cur.votes || 0), 0)
            || 0

        return <div className="question" key={qIdx}>
            <div className="left">
                <h6 className="accent-1">Question {qIdx + 1}</h6>
                <h3>{question.title.default || "No title"}</h3>
                <p className="light">{question.description.default || "No description"}</p>
            </div>
            <div className="right">
                {
                    question.choices.map((choice, cIdx) =>
                        this.canVote() ?
                            this.renderClickableChoice(qIdx, cIdx, choice.title.default, choice.value) :
                            this.shouldDisplayResults() ?
                                this.renderResultsChoice(cIdx, resultsQuestion, questionVoteCount) :
                                this.renderRawChoice(choice.title.default)
                    )
                }
            </div>
        </div>
    }

    renderClickableChoice(questionIdx: number, choiceIdx: number, title: string, choiceValue: number) {
        return <label className="radio-choice" key={choiceIdx}> <input type="radio" onClick={() => this.setQuestionChoice(questionIdx, choiceValue)} name={"question-" + questionIdx} />
            <div className="checkmark"></div> {title}
        </label>
    }

    renderRawChoice(title: string) {
        return <label className="radio-choice" key={title}>{title}</label>
    }

    renderResultsChoice(cIdx: number, resultsQuestion: DigestedProcessResultItem, totalVotes: number) {
        if (!resultsQuestion.voteResults || !resultsQuestion.voteResults[cIdx]) return null
        const title = resultsQuestion.voteResults[cIdx].title.default
        const voteCount = resultsQuestion.voteResults[cIdx].votes

        return <div className="choice-result" key={cIdx}>
            <div className="percent">
                <div className="box">{(totalVotes <= 0 ? 0 : (voteCount / totalVotes * 100)).toFixed(1)} %</div>
            </div>
            <div className="text">
                <span>{title}</span>
                <span className="lighter">{voteCount || 0} votes</span>
            </div>
        </div>
    }
}

export default ProcessPage
