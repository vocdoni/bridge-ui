import { useContext, Component } from 'react'
import Link from 'next/link'
import { ProcessMetadata } from 'dvote-js'
// import { message, Button, Spin, Divider, Input, Select, Col, Row, Card, Modal } from 'antd'
// import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
// import { getEntityId } from 'dvote-js/dist/api/entity'
// import Router from 'next/router'

// import { getGatewayClients, getNetworkState } from '../../lib/network'
import AppContext, { IAppContext } from '../../lib/app-context'
import Button from '../../components/button'
import { ProcessMetadataTemplate } from 'dvote-js'

// MAIN COMPONENT
const NewProcessPage = props => {
    // Get the global context and pass it to our stateful component
    const context = useContext(AppContext)

    return <NewProcessView {...context} />
}

type State = {
    metadata: ProcessMetadata,
    entityLoading?: boolean,
}

// Stateful component
class NewProcessView extends Component<IAppContext, State> {
    state: State = {
        metadata: ProcessMetadataTemplate
    }

    onSubmit() {
        alert("TO DO")
    }

    onAddOption(questionIndex: number) {
        console.log(questionIndex)
    }

    onAddpQuestion() {
        const metadata = this.state.metadata
        metadata.questions.push(ProcessMetadataTemplate.questions[0])
        this.setState({ metadata })
    }

    render() {
        return <div id="process-new">
            <div className="page-head">
                <div className="left">
                    <h1>New governance process</h1>
                    <h4 className="accent-1">Enter the details of a new governance process and submit them.</h4>
                </div>
                <div className="right">
                    <div className="v-center">Signed in as 0x1234... <img src="http://identicon.net/img/identicon.png" /></div>
                </div>
            </div>

            <div className="row-title">
                <div className="left">
                    <h2>Title</h2>
                    <div className="light">Short name to identify the process</div>
                    <input type="text" placeholder="Title" value={this.state.metadata.title.default} />
                </div>
                <div className="right">
                    <label className="radio-choice"> <input type="radio" name={"process-encryption"} />
                        <div className="checkmark"></div> Open poll
                    </label>
                    <label className="radio-choice"> <input type="radio" name={"process-encryption"} />
                        <div className="checkmark"></div> Encrypted results
                    </label>
                </div>
            </div>

            <div className="row-description">
                <div className="left">
                    <h2>Description</h2>
                    <div className="light">An optional introduction of about 2-3 lines</div>
                    <textarea placeholder="Description" value={this.state.metadata.description.default} />
                </div>
                <div className="right">
                    <input type="text" placeholder="Start date" />
                    <input type="text" placeholder="End date" />
                </div>
            </div>

            <div className="row-questions">
                {
                    this.state.metadata.questions.map((question, qIdx) => <div className="item" key={qIdx}>
                        <div className="question">
                            <div className="left">
                                <h6 className="accent-1">Question {qIdx + 1}</h6>
                                <h3>Question</h3>
                                <input type="text" placeholder="Title" value={question.title.default} onChange={ev => console.log(ev.target.value)} />

                                <h3>Description</h3>
                                <textarea placeholder="Description" value={question.description.default} onChange={ev => console.log(ev.target.value)} />
                            </div>
                            <div className="right" />
                        </div>
                        <div className="options">
                            <h3>Options</h3>
                            {
                                question.choices.map((option, oIdx) => <div className="option" key={oIdx}>
                                    <div className="left">
                                        <input type="text" placeholder="" value={option.title.default} onChange={ev => console.log(ev.target.value)} />
                                    </div>
                                    <div className="right">
                                        <div className={oIdx == question.choices.length - 1 ? "plus-box active" : "plus-box"} onClick={() => this.onAddOption(qIdx)}>+</div>
                                    </div>
                                </div>)
                            }
                        </div>

                        {qIdx == this.state.metadata.questions.length - 1 ?
                            <div className="add-question-btn" onClick={() => this.onAddpQuestion()}>Add question</div> : null
                        }
                    </div>)
                }
            </div>

            <div className="row-continue">
                <Button onClick={() => this.onSubmit()}>Submit process</Button>
            </div>

        </div>
    }
}

export default NewProcessPage
