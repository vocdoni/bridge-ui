import { useContext, Component } from 'react'
import Link from 'next/link'
import { API, ProcessMetadata } from 'dvote-js'
// import { message, Button, Spin, Divider, Input, Select, Col, Row, Card, Modal } from 'antd'
// import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
// import { getEntityId } from 'dvote-js/dist/api/entity'
// import Router from 'next/router'

// import { getGatewayClients, getNetworkState } from '../../lib/network'
import { IWallet } from '../../lib/types'
import AppContext, { IAppContext } from '../../components/app-context'
import Button from '../../components/button'

// MAIN COMPONENT
const ProcessPage = props => {
    // Get the global context and pass it to our stateful component
    const context = useContext(AppContext)

    return <ProcessView {...context} />
}

type State = {
    entityLoading?: boolean,
}

// Stateful component
class ProcessView extends Component<IAppContext, State> {
    state: State = {}

    onTokenFilter(value: { value: string, label: string }, options: { action: string, option: any, name: any }) {
        console.log(value, options)
    }

    onSubmit() {
        alert("TO DO")
    }

    render() {
        // TODO:
        const name = "DAI"
        const metadata: ProcessMetadata = {
            details: {
                title: { default: "Token supply expansion" },
                description: { default: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
                questions: [
                    {
                        question: { default: "Do you approve a minting of 900.000 new MKR Tokens?" },
                        description: { default: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
                        voteOptions: [
                            { title: { default: "Approve the minting" }, value: 0 },
                            { title: { default: "Reject the minting" }, value: 1 },
                            { title: { default: "I may accept another amount" }, value: 2 },
                        ],
                        type: "single-choice"
                    },
                    {
                        question: { default: "Do you approve a minting of 900.000 new MKR Tokens?" },
                        description: { default: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
                        voteOptions: [
                            { title: { default: "Approve the proposed minting" }, value: 0 },
                            { title: { default: "Approve up to 75% of the proposed amount" }, value: 1 },
                            { title: { default: "Approve up to 50% of the proposed amount" }, value: 2 },
                            { title: { default: "Approve up to 25% of the proposed amount" }, value: 3 },
                            { title: { default: "Reject the minting" }, value: 4 },
                        ],
                        type: "single-choice"
                    },
                    {
                        question: { default: "Do you approve a minting of 900.000 new MKR Tokens?" },
                        description: { default: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
                        voteOptions: [
                            { title: { default: "Approve the minting" }, value: 0 },
                            { title: { default: "Reject the minting" }, value: 1 },
                        ],
                        type: "single-choice"
                    }
                ],
                entityId: "",
                headerImage: "",
                streamUrl: ""
            },
            census: { merkleRoot: "", merkleTree: "" },
            numberOfBlocks: 1234,
            startBlock: 10,
            type: "poll-vote",
            version: "1.0"
        }
        const canVote = true
        const remainingTime = "3 days left"
        const status = "The process is open for voting"
        const choiceVoteCount = Math.round(Math.random() * 100)
        const questionVoteCount = 100

        return <div id="process">
            <div className="page-head">
                <div className="left">
                    <h1>{name} governance process</h1>
                    <h4 className="accent-1">Cast your vote and see the ongoing results as they are received.</h4>
                </div>
                <div className="right">
                    <div className="v-center">Signed in as 0x1234... <img src="http://identicon.net/img/identicon.png" /></div>
                </div>
            </div>

            <div className="row-description">
                <div className="left">
                    <h2>{metadata.details.title.default}</h2>
                    <h4 className="accent-1">{status}</h4>
                    <p className="light">{metadata.details.description.default}</p>
                </div>
                <div className="right">
                    <p className="light">{remainingTime}</p>
                </div>
            </div>

            <div className="row-questions">
                {
                    metadata.details.questions.map((question, qIdx) => <div className="question" key={qIdx}>
                        <div className="left">
                            <h6 className="accent-1">Question {qIdx + 1}</h6>
                            <h3>{question.question.default}</h3>
                            <p className="light">{question.description.default}</p>
                        </div>
                        <div className="right">
                            {
                                question.voteOptions.map((option, oIdx) => canVote ?
                                    this.renderClickableChoice(oIdx, qIdx, option.title.default, option.value) :
                                    this.renderResultsChoice(oIdx, option.title.default, choiceVoteCount, questionVoteCount))
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
