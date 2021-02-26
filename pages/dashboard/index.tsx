import { useEffect, useState } from "react";
import { VotingApi } from "dvote-js";
import Spinner from "react-svg-spinner";
import styled from "styled-components";
import { usePool } from "@vocdoni/react-hooks";

import TokenCard from "../../components/token-card";
// import Select from 'react-select'
import { useTokens } from "../../lib/hooks/tokens";
import { useRegisteredTokens } from "../../lib/hooks/registered-tokens";
import { getTokenProcesses } from "../../lib/api";
import { ProcessInfo, TokenInfo } from "../../lib/types";
import { limitedText } from "../../lib/util";
import { WalletStatus } from "../../components/wallet-status";
import { FALLBACK_TOKEN_ICON } from "../../lib/constants";

const Head = styled.div`
    display: flex;
`;

const LeftSection = styled.div`
    width: 70%;
`;

const RightSection = styled.div`
    width: 30%;
    margin-left: 2em;
    margin-top: 3em;
`;

const Title = styled.h1`
    margin-bottom: 5px;
`;

const Subtitle = styled.h4`
    margin-top: 5px;
    font-size: 20px;
    color: ${({ theme }) => theme.accent1};
`;

const TokenList = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin: 0 -1em;
    svg {
        margin: 1rem;
    }
`;

const LightText = styled.p`
    color: ${({ theme }) => theme.lightText};
`;

const Loader = styled(Spinner)`
    margin: 1rem;
`;

// MAIN COMPONENT
const DashboardPage = () => {
    const { poolPromise } = usePool();
    const {
        registeredTokens: tokenAddrs,
        error: tokenListError,
    } = useRegisteredTokens();
    const [blockNumber, setBlockNumber] = useState(0);
    const [loadingProcesses, setLoadingProcesses] = useState(false);
    const [processes, setProcesses] = useState<ProcessInfo[]>([]);
    const tokenInfos = useTokens(tokenAddrs);

    // Block update
    useEffect(() => {
        const updateBlockHeight = () => {
            poolPromise
                .then((pool) => VotingApi.getBlockHeight(pool))
                .then((num) => setBlockNumber(num))
                .catch((err) => console.error(err));
        };

        const interval = setInterval(() => updateBlockHeight, 1000 * 15);
        updateBlockHeight();

        // Done
        return () => clearInterval(interval);
    }, []);

    // Process list fetch
    useEffect(() => {
        let skip = false;

        setLoadingProcesses(true);

        poolPromise
            .then((pool) => {
                return Promise.all(
                    tokenAddrs.map((addr) => getTokenProcesses(addr, pool))
                );
            })
            .then((processArrays) => {
                if (skip) return;

                const procs = processArrays.reduce(
                    (prev, cur) => prev.concat(cur),
                    []
                );
                setProcesses(procs);
                setLoadingProcesses(false);
            })
            .catch((err) => {
                setLoadingProcesses(false);
            });

        return () => {
            skip = true;
        };
    }, [tokenAddrs]);

    // RENDER

    // const options = allTokens.map(token => ({ label: token.name, value: token.symbol }))
    // options.unshift({ label: "(all tokens)", value: "" })

    const upcomingProcesses = processes.filter(
        (proc) => blockNumber < proc.parameters.startBlock
    );
    const activeProcesses = processes.filter(
        (proc) =>
            blockNumber >= proc.parameters.startBlock &&
            blockNumber <
                proc.parameters.startBlock + proc.parameters.blockCount
    );
    const endedProcesses = processes.filter(
        (proc) =>
            blockNumber >=
            proc.parameters.startBlock + proc.parameters.blockCount
    );

    const DASHBOARD_VOTING_SECTIONS = [
        {
            title: "Active votes",
            processes: activeProcesses,
            processesMessage:
                "Below are the votes belonging to the available tokens.",
            noProcessesMessage: "There are no active votes at this moment.",
        },
        {
            title: "Vote results",
            processes: endedProcesses,
            processesMessage:
                "Below are the results for votes related to your tokens.",
            noProcessesMessage: "There are no votes with results to display.",
        },
        {
            title: "Upcoming votes",
            processes: upcomingProcesses,
            processesMessage: "Below are the votes scheduled to start soon.",
            noProcessesMessage: "There are no votes scheduled to start soon.",
        },
    ];

    return (
        <div>
            <Head>
                <LeftSection>
                    <Title>My Dashboard</Title>
                    <Subtitle>
                        Vote on the open processes and see the results of the
                        ones that already ended.
                    </Subtitle>
                </LeftSection>
                <RightSection>
                    <WalletStatus />
                    {/* <Select options={options} onChange={(value, options) => this.onTokenFilter(value, options)} /> */}
                </RightSection>
            </Head>

            {DASHBOARD_VOTING_SECTIONS.map((section) => (
                <VoteSection
                    {...section}
                    loadingProcesses={loadingProcesses}
                    tokenInfos={tokenInfos}
                />
            ))}
        </div>
    );
};

const VoteSection = ({
    processes,
    tokenInfos,
    loadingProcesses,
    title,
    noProcessesMessage,
    processesMessage,
}) => {
    const Processes = () =>
        processes.map((proc) => {
            const token = tokenInfos.get(proc.tokenAddress);
            return <ProcessCard process={proc} token={token} />;
        });

    return (
        <div>
            <h2>{title}</h2>
            <LightText>
                {processes.length ? processesMessage : noProcessesMessage}
            </LightText>
            <TokenList>
                {loadingProcesses ? <Spinner /> : <Processes />}
            </TokenList>
        </div>
    );
};

const ProcessCard = (props: { process: ProcessInfo; token?: TokenInfo }) => {
    const proc = props.process;
    const icon =
        process.env.ETH_NETWORK_ID == "goerli"
            ? FALLBACK_TOKEN_ICON
            : props?.token.icon;

    return (
        <TokenCard
            key={proc.id}
            name={props?.token?.symbol}
            icon={icon}
            rightText={/*strDateDiff()*/ ""}
            href={proc?.id ? "/processes#/" + proc.id : ""}
        >
            <p>
                <strong>
                    {limitedText(proc?.metadata?.title?.default, 35) ||
                        "No title"}
                </strong>
                <br />
                {limitedText(proc?.metadata?.description?.default) ||
                    "No description"}
            </p>
        </TokenCard>
    );
};

export default DashboardPage;
