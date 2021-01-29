import { useState } from 'react'
import { CensusErc20Api, IProcessCreateParams, ProcessCensusOrigin, ProcessContractParameters, ProcessEnvelopeType, ProcessMetadata, ProcessMode, VotingApi } from 'dvote-js'

import { usePool, useSigner } from '@vocdoni/react-hooks'
import { useUrlHash } from 'use-url-hash'
import { useWallet } from 'use-wallet'
import Button from '../../components/button'
import { ProcessMetadataTemplate } from 'dvote-js'
import { WalletStatus } from '../../components/wallet-status'
import Datetime from "react-datetime"
import { Moment } from 'moment'
import moment from 'moment'
import { providers } from 'ethers'
import Router from 'next/router'
import Spinner from "react-svg-spinner"

// MAIN COMPONENT
const NewProcessPage = props => {
    const { poolPromise } = usePool()
    const signer = useSigner()
    const wallet = useWallet()
    const [metadata, setMetadata] = useState<ProcessMetadata>(JSON.parse(JSON.stringify(ProcessMetadataTemplate)))
    const [envelopeType, setEnvelopeType] = useState(new ProcessEnvelopeType(0))
    const [startDate, setStartDate] = useState(null as Date)
    const [endDate, setEndDate] = useState(null as Date)
    const tokenAddress = useUrlHash().substr(1)
    const [submitting, setSubmitting] = useState(false)

    // Callbacks
    const onStartDate = (date: string | Moment) => {
        if (typeof date == "string") return
        setStartDate(date.toDate())
    }
    const onEndDate = (date: string | Moment) => {
        if (typeof date == "string") return
        setEndDate(date.toDate())
    }

    const setMainTitle = (title: string) => {
        metadata.title.default = title
        setMetadata(Object.assign({}, metadata))
    }
    const setMainDescription = (description: string) => {
        metadata.description.default = description
        setMetadata(Object.assign({}, metadata))
    }
    const setEncryptedVotes = (value: boolean) => {
        let current = envelopeType.value
        if (value) current = current | ProcessEnvelopeType.ENCRYPTED_VOTES
        else current = current & (~ProcessEnvelopeType.ENCRYPTED_VOTES) & 0xff
        setEnvelopeType(new ProcessEnvelopeType(current))
    }
    const setQuestionTitle = (qIdx: number, title: string) => {
        if (!metadata.questions[qIdx]) return
        metadata.questions[qIdx].title.default = title
        setMetadata(Object.assign({}, metadata))
    }
    const setQuestionDescription = (qIdx: number, description: string) => {
        if (!metadata.questions[qIdx]) return
        metadata.questions[qIdx].description.default = description
        setMetadata(Object.assign({}, metadata))
    }
    const setChoiceText = (qIdx, cIdx, text: string) => {
        if (!metadata.questions[qIdx]) return
        else if (!metadata.questions[qIdx].choices[cIdx]) return
        metadata.questions[qIdx].choices[cIdx].title.default = text
        setMetadata(Object.assign({}, metadata))
    }
    const onAddQuestion = () => {
        metadata.questions.push(JSON.parse(JSON.stringify(ProcessMetadataTemplate.questions[0])))
        setMetadata(Object.assign({}, metadata))
    }
    const onAddChoice = (qIdx: number) => {
        if (!metadata.questions[qIdx]) return
        metadata.questions[qIdx].choices.push({
            title: { default: "" },
            value: metadata.questions[qIdx].choices.length
        })
        setMetadata(Object.assign({}, metadata))
    }
    const onRemoveChoice = (qIdx: number, cIdx: number) => {
        if (!metadata.questions[qIdx]) return
        else if (metadata.questions[qIdx].choices.length <= 2) return

        metadata.questions[qIdx].choices.splice(cIdx, 1)
        for (let i = 0; i < metadata.questions[qIdx].choices.length; i++) {
            metadata.questions[qIdx].choices[i].value = i
        }
        setMetadata(Object.assign({}, metadata))
    }
    const onSubmit = async () => {
        if (!metadata.title || metadata.title.default.trim().length < 2) return alert("Please enter a title")
        else if (metadata.title.default.trim().length > 50) return alert("Please enter a shorter title")

        if (!metadata.description || metadata.description.default.trim().length < 2) return alert("Please enter a description")
        else if (metadata.description.default.trim().length > 300) return alert("Please enter a shorter description")

        if (!startDate) return alert("Please, enter a start date")
        else if (!endDate) return alert("Please, enter an ending date")

        if (moment(startDate).isBefore(moment().add(5, "minutes"))) {
            return alert("The start date must be at least 5 minutes from now")
        }
        else if (moment(endDate).isBefore(moment().add(10, "minutes"))) {
            return alert("The end date must be at least 10 minutes from now")
        }
        else if (moment(endDate).isBefore(moment(startDate).add(5, "minutes"))) {
            return alert("The end date must be at least 5 minutes after the start")
        }

        for (let qIdx = 0; qIdx < metadata.questions.length; qIdx++) {
            const question = metadata.questions[qIdx]
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

        if (!tokenAddress || !tokenAddress.match(/^0x[0-9a-fA-F]{40}$/))
            return alert("The token address it not valid")

        if (!wallet?.account) return alert("In order to continue, you need to use a Web3 provider like MetaMask")

        // FINAL CONFIRMATION
        if (!confirm("You are about to create a new governance process. The process cannot be altered, paused or canceled.\n\nDo you want to continue?")) return

        // Continue
        try {
            setSubmitting(true)
            const pool = await poolPromise

            // Estimate start/end blocks
            const [startBlock, endBlock] = await Promise.all([
                VotingApi.estimateBlockAtDateTime(startDate, pool),
                VotingApi.estimateBlockAtDateTime(endDate, pool),
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
                metadata: metadata,
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
            setSubmitting(false)

            alert("The governance process has been created successfully")
        } catch (err) {
            setSubmitting(false)

            console.error(err)
            alert("The governance process could not be created")
        }
    }


    // Render

    return <div id="process-new">
        <div className="page-head">
            <div className="left">
                <h1>New governance process</h1>
                <h4 className="accent-1">Enter the details of a new governance process and submit them.</h4>
            </div>
            <div className="right">
                <WalletStatus />
            </div>
        </div>

        <div className="row-title">
            <div className="left">
                <h2>Title</h2>
                <div className="light">Short name to identify the process</div>
                <input type="text" placeholder="Title" onChange={e => setMainTitle(e.target.value)} value={metadata.title.default} />
            </div>
            <div className="right">
                <label className="radio-choice" onClick={() => setEncryptedVotes(false)}> <input type="radio" readOnly checked={!envelopeType.hasEncryptedVotes} name="vote-encryption" />
                    <div className="checkmark"></div> Real-time results
            </label>
                <label className="radio-choice" onClick={() => setEncryptedVotes(true)}> <input type="radio" readOnly checked={envelopeType.hasEncryptedVotes} name="vote-encryption" />
                    <div className="checkmark"></div> Encrypted results
            </label>
            </div>
        </div>

        <div className="row-description">
            <div className="left">
                <h2>Description</h2>
                <div className="light">An introduction of about 2-3 lines</div>
                <textarea placeholder="Description" onChange={e => setMainDescription(e.target.value)} value={metadata.description.default} />
            </div>
            <div className="right">
                <div style={{ display: "block" }}>
                    <Datetime
                        value={startDate}
                        inputProps={{ placeholder: "Start date (d/m/y h:m)" }}
                        isValidDate={(cur: Moment) => isValidFutureDate(cur)}
                        dateFormat="D/MM/YYYY"
                        timeFormat="HH:mm[h]"
                        onChange={date => onStartDate(date)}
                        strictParsing />
                    <Datetime
                        value={endDate}
                        inputProps={{ placeholder: "End date (d/m/y h:m)" }}
                        isValidDate={(cur: Moment) => isValidFutureDate(cur)}
                        dateFormat="D/MM/YYYY"
                        timeFormat="HH:mm[h]"
                        onChange={date => onEndDate(date)}
                        strictParsing />
                </div>
            </div>
        </div>

        <div className="row-questions">
            {
                metadata.questions.map((question, qIdx) => <div className="item" key={qIdx}>
                    <div className="question">
                        <div className="left">
                            <h6 className="accent-1">Question {qIdx + 1}</h6>
                            <h3>Question</h3>
                            <input type="text" placeholder="Title" value={question.title.default} onChange={ev => setQuestionTitle(qIdx, ev.target.value)} />

                            <h3>Description</h3>
                            <textarea placeholder="Description" value={question.description.default} onChange={ev => setQuestionDescription(qIdx, ev.target.value)} />
                        </div>
                        <div className="right" />
                    </div>
                    <div className="choices">
                        <h3>Choices</h3>
                        {
                            question.choices.map((choice, cIdx) => <div className="choice" key={cIdx}>
                                <div className="left">
                                    <input type="text" placeholder="Choice" value={choice.title.default} onChange={ev => setChoiceText(qIdx, cIdx, ev.target.value)} />
                                </div>
                                <div className="right">
                                    <div className={
                                        cIdx == question.choices.length - 1 && question.choices[cIdx].title.default ?
                                            "plus-box add" :
                                            question.choices.length == 2 ? "plus-box" : "plus-box remove"
                                    }
                                        onClick={() => cIdx == question.choices.length - 1 && question.choices[cIdx].title.default ?
                                            onAddChoice(qIdx) :
                                            onRemoveChoice(qIdx, cIdx)
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

                    {qIdx == metadata.questions.length - 1 ?
                        <div className="add-question-btn" onClick={() => onAddQuestion()}>Add question</div> : null
                    }
                </div>)
            }
        </div>

        <div className="row-continue">
            {
                submitting ?
                    <p className="status">Please wait...<Spinner /></p> :
                    <Button onClick={() => onSubmit()}>Submit process</Button>
            }
        </div>

    </div>
}

function isValidFutureDate(date: Moment): boolean {
    const threshold = new Date(Date.now() - 1000 * 60 * 60 * 24)
    return date.isAfter(threshold)
}

export default NewProcessPage
