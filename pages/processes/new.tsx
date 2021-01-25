import { useContext, Component } from 'react'
// import Link from 'next/link'
import { CensusErc20Api, IProcessCreateParams, ProcessCensusOrigin, ProcessContractParameters, ProcessEnvelopeType, ProcessMetadata, ProcessMode, VotingApi } from 'dvote-js'
// import Router from 'next/router'

import AppContext, { IAppContext } from '../../lib/app-context'
import Button from '../../components/button'
import { ProcessMetadataTemplate } from 'dvote-js'
import { WalletStatus } from '../../components/wallet-status'
import Datetime from "react-datetime"
import { Moment } from 'moment'
import moment from 'moment'
import { cursorTo } from 'readline'
import { ensureConnectedVochain } from '../../lib/api'
import { connectWeb3, getWeb3 } from '../../lib/web3'
import { getPool } from '../../lib/vochain'
import { providers } from 'ethers'
import Router from 'next/router'

// MAIN COMPONENT
const NewProcessPage = props => {
    // Get the global context and pass it to our stateful component
    const context = useContext(AppContext)

    return <NewProcessView {...context} />
}

type State = {
    metadata: ProcessMetadata,
    envelopeType: ProcessEnvelopeType,
    startDate: Date,
    endDate: Date,
    entityLoading?: boolean,
}

// Stateful component
class NewProcessView extends Component<IAppContext, State> {
    state: State = {
        metadata: JSON.parse(JSON.stringify(ProcessMetadataTemplate)),
        envelopeType: new ProcessEnvelopeType(0),
        startDate: null,
        endDate: null,
    }

    resolveTokenAddress(): string {
        if (typeof window != "undefined") return location.hash.substr(2)
        else if (this.props.urlHash) return this.props.urlHash
        else return ""
    }

    setMainTitle(title: string) {
        const metadata = this.state.metadata
        metadata.title.default = title
        this.setState({ metadata })
    }

    setMainDescription(description: string) {
        const metadata = this.state.metadata
        metadata.description.default = description
        this.setState({ metadata })
    }

    setEncryptedVotes(value: boolean) {
        let current = this.state.envelopeType.value

        if (value) {
            current = current | ProcessEnvelopeType.ENCRYPTED_VOTES
        }
        else {
            current = current & (~ProcessEnvelopeType.ENCRYPTED_VOTES) & 0xff
        }
        this.setState({ envelopeType: new ProcessEnvelopeType(current) })
    }

    setStartDate(date: string | Moment) {
        if (typeof date == "string") return
        this.setState({ startDate: date.toDate() })
    }
    setEndDate(date: string | Moment) {
        if (typeof date == "string") return
        this.setState({ endDate: date.toDate() })
    }

    onAddQuestion() {
        const metadata = this.state.metadata
        metadata.questions.push(JSON.parse(JSON.stringify(ProcessMetadataTemplate.questions[0])))
        this.setState({ metadata })
    }

    onAddChoice(qIdx: number) {
        const metadata = this.state.metadata
        if (!metadata.questions[qIdx]) return
        metadata.questions[qIdx].choices.push({
            title: { default: "" },
            value: metadata.questions[qIdx].choices.length
        })
        this.setState({ metadata })
    }

    onRemoveChoice(qIdx: number, cIdx: number) {
        const metadata = this.state.metadata
        if (!metadata.questions[qIdx]) return
        else if (metadata.questions[qIdx].choices.length <= 2) return

        metadata.questions[qIdx].choices.splice(cIdx, 1)
        for (let i = 0; i < metadata.questions[qIdx].choices.length; i++) {
            metadata.questions[qIdx].choices[i].value = i
        }
        this.setState({ metadata })
    }

    setQuestionTitle(qIdx: number, title: string) {
        const metadata = this.state.metadata
        if (!metadata.questions[qIdx]) return
        metadata.questions[qIdx].title.default = title
        this.setState({ metadata })
    }
    setQuestionDescription(qIdx: number, description: string) {
        const metadata = this.state.metadata
        if (!metadata.questions[qIdx]) return
        metadata.questions[qIdx].description.default = description
        this.setState({ metadata })
    }
    setChoiceText(qIdx, cIdx, text: string) {
        const metadata = this.state.metadata
        if (!metadata.questions[qIdx]) return
        else if (!metadata.questions[qIdx].choices[cIdx]) return
        metadata.questions[qIdx].choices[cIdx].title.default = text
        this.setState({ metadata })
    }

    isValidFutureDate(date: Moment): boolean {
        const threshold = new Date(Date.now() - 1000 * 60 * 60 * 24)

        return date.isAfter(threshold)
    }

    async onSubmit() {
        if (!this.state.metadata.title || this.state.metadata.title.default.trim().length < 2) return alert("Please enter a title")
        else if (this.state.metadata.title.default.trim().length > 50) return alert("Please enter a shorter title")

        if (!this.state.metadata.description || this.state.metadata.description.default.trim().length < 2) return alert("Please enter a description")
        else if (this.state.metadata.description.default.trim().length > 300) return alert("Please enter a shorter description")

        if (!this.state.startDate) return alert("Please, enter a start date")
        else if (!this.state.endDate) return alert("Please, enter an ending date")

        if (moment(this.state.startDate).isBefore(moment().add(5, "minutes"))) {
            return alert("The start date must be at least 5 minutes from now")
        }
        else if (moment(this.state.endDate).isBefore(moment().add(10, "minutes"))) {
            return alert("The end date must be at least 10 minutes from now")
        }
        else if (moment(this.state.endDate).isBefore(moment(this.state.startDate).add(5, "minutes"))) {
            return alert("The end date must be at least 5 minutes after the start")
        }

        for (let qIdx = 0; qIdx < this.state.metadata.questions.length; qIdx++) {
            const question = this.state.metadata.questions[qIdx]
            if (!question.title.default.trim())
                return alert("Please, enter a title for question " + (qIdx + 1))

            for (let cIdx = 0; cIdx < question.choices.length; cIdx++) {
                const choice = question.choices[cIdx]
                if (!choice.title.default.trim())
                    return alert("Please, fill in all the choices for question " + (qIdx + 1))

                // Ensure values are unique and sequential
                question.choices[cIdx].value = cIdx
            }
        }

        const tokenAddress = this.resolveTokenAddress()
        if (!tokenAddress || !tokenAddress.match(/^0x[0-9a-fA-F]{40}$/))
            return alert("The token address it not valid")

        // FINAL CONFIRMATION
        if (!confirm("You are about to create a new governance process.\n\nDo you want to continue?")) return

        // Continue
        try {
            await connectWeb3()
            await ensureConnectedVochain()
            const pool = getPool()
            const { signer } = getWeb3()

            // Estimate start/end blocks
            const [startBlock, endBlock] = await Promise.all([
                VotingApi.estimateBlockAtDateTime(this.state.startDate, pool),
                VotingApi.estimateBlockAtDateTime(this.state.endDate, pool),
            ])
            const blockCount = endBlock - startBlock

            // Fetch EMV proof
            const holderAddress = await signer.getAddress()
            const tokenBalanceMappingPosition = await CensusErc20Api.getBalanceMappingPosition(tokenAddress, pool)

            const evmBlockHeight = await pool.provider.getBlockNumber()
            const balanceSlot = CensusErc20Api.getHolderBalanceSlot(holderAddress, tokenBalanceMappingPosition.toNumber())
            const { proof } = await CensusErc20Api.generateProof(tokenAddress, [balanceSlot], evmBlockHeight, pool.provider as providers.JsonRpcProvider)

            const processParamsPre: Omit<Omit<IProcessCreateParams, "metadata">, "questionCount"> & { metadata: ProcessMetadata } = {
                mode: ProcessMode.make({ autoStart: true }),
                envelopeType: ProcessEnvelopeType.make({}), // bit mask
                censusOrigin: ProcessCensusOrigin.ERC20,
                metadata: this.state.metadata,
                censusRoot: proof.storageHash,
                startBlock,
                blockCount,
                maxCount: 1,
                maxValue: 3,
                maxTotalCost: 0,
                costExponent: 10000,
                maxVoteOverwrites: 1,
                evmBlockHeight,
                tokenAddress,
                namespace: 0,
                paramsSignature: "0x0000000000000000000000000000000000000000000000000000000000000000"
            }

            const processId = await VotingApi.newProcess(processParamsPre, signer, pool)
            Router.push("/processes#/" + processId)

            alert("The governance process has been created successfully")
        } catch (err) {
            console.error(err)
            alert("The governance process could not be created")
        }
    }

    render() {
        const { holderAddress } = this.props

        return <div id="process-new">
            <div className="page-head">
                <div className="left">
                    <h1>New governance process</h1>
                    <h4 className="accent-1">Enter the details of a new governance process and submit them.</h4>
                </div>
                <div className="right">
                    <WalletStatus address={holderAddress} />
                </div>
            </div>

            <div className="row-title">
                <div className="left">
                    <h2>Title</h2>
                    <div className="light">Short name to identify the process</div>
                    <input type="text" placeholder="Title" onChange={e => this.setMainTitle(e.target.value)} value={this.state.metadata.title.default} />
                </div>
                <div className="right">
                    <label className="radio-choice" onClick={() => this.setEncryptedVotes(false)}> <input type="radio" readOnly checked={!this.state.envelopeType.hasEncryptedVotes} name="vote-encryption" />
                        <div className="checkmark"></div> Real-time results
                    </label>
                    <label className="radio-choice" onClick={() => this.setEncryptedVotes(true)}> <input type="radio" readOnly checked={this.state.envelopeType.hasEncryptedVotes} name="vote-encryption" />
                        <div className="checkmark"></div> Encrypted results
                    </label>
                </div>
            </div>

            <div className="row-description">
                <div className="left">
                    <h2>Description</h2>
                    <div className="light">An introduction of about 2-3 lines</div>
                    <textarea placeholder="Description" onChange={e => this.setMainDescription(e.target.value)} value={this.state.metadata.description.default} />
                </div>
                <div className="right">
                    <div style={{ display: "block" }}>
                        <Datetime
                            value={this.state.startDate}
                            inputProps={{ placeholder: "Start date (d/m/y h:m)" }}
                            isValidDate={(cur: Moment) => this.isValidFutureDate(cur)}
                            dateFormat="D/MM/YYYY"
                            timeFormat="HH:mm[h]"
                            onChange={date => this.setStartDate(date)}
                            strictParsing />
                        <Datetime
                            value={this.state.endDate}
                            inputProps={{ placeholder: "End date (d/m/y h:m)" }}
                            isValidDate={(cur: Moment) => this.isValidFutureDate(cur)}
                            dateFormat="D/MM/YYYY"
                            timeFormat="HH:mm[h]"
                            onChange={date => this.setEndDate(date)}
                            strictParsing />
                    </div>
                </div>
            </div>

            <div className="row-questions">
                {
                    this.state.metadata.questions.map((question, qIdx) => <div className="item" key={qIdx}>
                        <div className="question">
                            <div className="left">
                                <h6 className="accent-1">Question {qIdx + 1}</h6>
                                <h3>Question</h3>
                                <input type="text" placeholder="Title" value={question.title.default} onChange={ev => this.setQuestionTitle(qIdx, ev.target.value)} />

                                <h3>Description</h3>
                                <textarea placeholder="Description" value={question.description.default} onChange={ev => this.setQuestionDescription(qIdx, ev.target.value)} />
                            </div>
                            <div className="right" />
                        </div>
                        <div className="choices">
                            <h3>Choices</h3>
                            {
                                question.choices.map((choice, cIdx) => <div className="choice" key={cIdx}>
                                    <div className="left">
                                        <input type="text" placeholder="Choice" value={choice.title.default} onChange={ev => this.setChoiceText(qIdx, cIdx, ev.target.value)} />
                                    </div>
                                    <div className="right">
                                        <div className={
                                            cIdx == question.choices.length - 1 && question.choices[cIdx].title.default ?
                                                "plus-box add" :
                                                question.choices.length == 2 ? "plus-box" : "plus-box remove"
                                        }
                                            onClick={() => cIdx == question.choices.length - 1 && question.choices[cIdx].title.default ?
                                                this.onAddChoice(qIdx) :
                                                this.onRemoveChoice(qIdx, cIdx)
                                            }>
                                            {
                                                cIdx == question.choices.length - 1 && question.choices[cIdx].title.default ?
                                                    "+" : "⨯"
                                            }
                                        </div>
                                    </div>
                                </div>)
                            }
                        </div>

                        {qIdx == this.state.metadata.questions.length - 1 ?
                            <div className="add-question-btn" onClick={() => this.onAddQuestion()}>Add question</div> : null
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
