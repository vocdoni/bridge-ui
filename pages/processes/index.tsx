import { useContext, Component } from 'react'
import Link from 'next/link'
import { VotingApi, ProcessMetadata, ProcessContractParameters } from 'dvote-js'
import { getProcessInfo } from '../../lib/api'
import { ProcessInfo } from "../../lib/types"
// import { message, Button, Spin, Divider, Input, Select, Col, Row, Card, Modal } from 'antd'
// import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
// import { getEntityId } from 'dvote-js/dist/api/entity'
// import Router from 'next/router'

// import { getGatewayClients, getNetworkState } from '../../lib/network'
import AppContext, { IAppContext } from '../../lib/app-context'
import Button from '../../components/button'
import { getPool } from '../../lib/vochain'
import { strDateDiff } from '../../lib/date'

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
    endDate: Date
}

// Stateful component
class ProcessView extends Component<IAppContext, State> {
    state: State = {
        process: null,
        startDate: null,
        endDate: null
    }

    componentDidMount() {
        const processId = this.resolveProcessId()
        const loadedProcess = this.props.allProcesses.find(p => p.id = processId)
        if (loadedProcess) return this.estimateDates(loadedProcess.parameters)

        return getProcessInfo(processId).then(proc => {
            this.setState({ process: proc })

            return this.estimateDates(proc.parameters)
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
        if (this.props.urlHash) return this.props.urlHash
        else if (typeof window == "undefined") return ""
        return location.hash.substr(2)
    }

    onSubmit() {
        alert("TO DO")
    }

    renderEmpty() {
        // TODO:
        return <div></div>
    }

    render() {
        const { holderAddress } = this.props
        const processId = this.resolveProcessId()
        if (!processId) return this.renderEmpty()

        const proc = this.state.process ?
            this.state.process :
            this.props.allProcesses.find(p => p.id == processId)
        if (!proc) return this.renderEmpty()

        // TODO: REAL VALUES
        const now = Date.now()
        const hasStarted = this.state.startDate && now >= this.state.startDate.getTime()
        const hasEnded = this.state.endDate && now >= this.state.endDate.getTime()
        const canVote = proc.parameters.status.isReady

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
                                question.choices.map((option, oIdx) =>
                                    proc.parameters.status.isReady ?
                                        this.renderClickableChoice(oIdx, qIdx, option.title.default, option.value) :
                                        this.renderResultsChoice(oIdx, option.title.default, choiceVoteCount, questionVoteCount)
                                )
                            }
                        </div>
                    </div>)
                }
            </div>

            <br /><br />

            <div className="row-continue">
                <Button onClick={() => this.onSubmit()}>Sign and submit the vote</Button>
            </div>

        </div>
    }

    renderClickableChoice(choiceIdx: number, questionIdx: number, title: string, value: number) {
        return <label className="radio-choice" key={choiceIdx}> <input type="radio" name={"question-" + questionIdx} />
            <div className="checkmark"></div> {title}
        </label>
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
