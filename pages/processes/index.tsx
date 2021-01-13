import { useContext, Component, ReactNode } from 'react'
import Link from 'next/link'
import { VotingApi, ProcessContractParameters, CensusErc20Api, DigestedProcessResults } from 'dvote-js'
import { getProcessInfo } from '../../lib/api'
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
            const interval = (parseInt(process.env.BLOCK_TIME || '10', 10) || 10) * 1000
            this.refreshInterval = setInterval(
                () => this.refreshBlockHeight(),
                interval
            )
        }).catch(err => console.error(err))
    }

    componentWillUnmount() {
        clearInterval(this.refreshInterval)
    }

    refreshBlockHeight() {
        return VotingApi.getBlockHeight(getPool())
            .then(height => {
                this.setState({ currentBlock: height })
            })
    }

    async refreshVoteState(proc: ProcessInfo) {
        try {
            const pool = getPool()
            const holderAddr = await this.props.signer.getAddress()
            this.setState({ refreshingVoteStatus: true })
            const token = allTokens.find(t => t.address.toLowerCase() == this.state.process.parameters.entityAddress.toLowerCase())

            if (!token || !await CensusErc20Api.isRegistered(token.address, pool)) {
                alert("The token contract is not yet registered")
                return
            }

            const blockNumber = await pool.provider.getBlockNumber()
            const balanceSlot = CensusErc20Api.getHolderBalanceSlot(holderAddr, token.balanceMappingPosition)
            const proofFields = await CensusErc20Api.generateProof(token.address, [balanceSlot], blockNumber, pool.provider as providers.JsonRpcProvider)
            const { proof, block, blockHeaderRLP, accountProofRLP, storageProofsRLP } = proofFields

            if (proof) this.setState({ censusProof: proof.storageProof[0] })

            const nullifier = await VotingApi.getSignedVoteNullifier(holderAddr, proc.id)
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

    refreshVoteResults() {
        const processId = this.resolveProcessId()
        const pool = getPool()

        // return VotingApi.getRawResults(processId, pool).then(console.log)
        return VotingApi.getResultsDigest(processId, pool).then(results => {
            this.setState({ results })
        })
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

            // Detect encryption
            if (proc.parameters.envelopeType.hasEncryptedVotes) {
                const keys = await VotingApi.getProcessKeys(proc.id, pool)
                const { envelope, signature } = await VotingApi.packageSignedEnvelope({
                    votes,
                    censusOrigin: proc.parameters.censusOrigin,
                    censusProof: this.state.censusProof,
                    processId: proc.id,
                    walletOrSigner: this.props.signer,
                    processKeys: keys
                })
                await VotingApi.submitEnvelope(envelope, signature, pool)
            } else {
                const { envelope, signature } = await VotingApi.packageSignedEnvelope({
                    votes,
                    censusOrigin: proc.parameters.censusOrigin,
                    censusProof: this.state.censusProof,
                    processId: proc.id,
                    walletOrSigner: this.props.signer
                })
                await VotingApi.submitEnvelope(envelope, signature, pool)
            }

            await new Promise(resolve => setTimeout(resolve, Math.floor(parseInt(process.env.BLOCK_TIME) * 1000)))

            for (let i = 0; i < 10; i++) {
                await this.refreshVoteState(proc)
                if (this.state.hasVoted) break
                await new Promise(resolve => setTimeout(resolve, Math.floor(parseInt(process.env.BLOCK_TIME) * 500)))
            }
            if (!this.state.hasVoted) throw new Error('The vote has not been registered')

            alert("Your vote has been sucessfully submitted")
            this.setState({ isSubmitting: false })

            await this.refreshVoteResults()
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
        else if (this.state.hasVoted && this.state.results) return true
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
                strDateDiff(this.state.endDate) :
                strDateDiff(this.state.startDate)) : ""

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
                    {
                        holderAddress ?
                            <div className="v-center">Signed in as {holderAddress.substr(0, 10)}... <img src="http://identicon.net/img/identicon.png" /></div> :
                            <div className="v-center">(Metamask is not connected)</div>
                    }
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
                    proc.metadata.questions.map((question, qIdx) => <div className="question" key={qIdx}>
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
                                            this.renderResultsChoice(cIdx, choice.title.default, choiceVoteCount, questionVoteCount) :
                                            this.renderRawChoice(choice.title.default)
                                )
                            }
                        </div>
                    </div>)
                }
            </div>

            <br /><br />

            <div className="row-continue">
                {this.renderStatusFooter()}
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

    renderResultsChoice(idx: number, title: string, voteCount: number, totalVotes) {
        return <div className="choice-result" key={idx}>
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
