import React, { useEffect, useMemo, useState } from "react";
import { VotingApi } from "dvote-js";
import Spinner from "react-svg-spinner";
import styled from "styled-components";
import { usePool } from "@vocdoni/react-hooks";
import { useWallet } from "use-wallet";
import { useRouter } from "next/router";

import TokenCard from "../../components/token-card";
// import Select from 'react-select'
import { useTokens, useRegisteredTokens } from "../../lib/hooks/tokens";
import { getTokenProcesses } from "../../lib/api";
import { ProcessInfo, TokenInfo } from "../../lib/types";
import { limitedText } from "../../lib/utils";
import { FALLBACK_TOKEN_ICON } from "../../lib/constants";
import { TopSection } from "../../components/top-section";
import { useScrollTop } from "../../lib/hooks/useScrollTop";

export const TokenList = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-left: -10px;

  @media ${({ theme }) => theme.screens.tabletL} {
    & > div:first-child {
      margin-left: 10px;
    }
    & > div:nth-child(4n) {
      margin-left: 10px;
    }
    margin: 0 10px;
    justify-content: center;
    text-align: start;
  }
`;

export const LightText = styled.p`
  color: ${({ theme }) => theme.grayScale.g5};
  font-size: 18px;
`;

export const VoteSectionContainer = styled.div`
  margin-bottom: 60px;
`;

// MAIN COMPONENT
const DashboardPage = () => {
  useScrollTop();
  const { account } = useWallet();
  const router = useRouter();
  const { poolPromise } = usePool();
  const { registeredTokens: tokenAddrs, error: tokenListError } = useRegisteredTokens();
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

    const interval = setInterval(() => updateBlockHeight(), 1000 * 15);
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
        return Promise.all(tokenAddrs.map((addr) => getTokenProcesses(addr, pool)));
      })
      .then((processArrays) => {
        if (skip) return;

        const procs = processArrays.reduce((prev, cur) => prev.concat(cur), []);
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

  useEffect(() => {
    if (!account) {
      router.replace("/");
    }
  }, [account]);

  const upcomingProcesses = processes.filter((proc) => blockNumber < proc.parameters.startBlock);
  const activeProcesses = processes.filter(
    (proc) =>
      blockNumber >= proc.parameters.startBlock &&
      blockNumber < proc.parameters.startBlock + proc.parameters.blockCount
  );
  const endedProcesses = processes.filter(
    (proc) => blockNumber >= proc.parameters.startBlock + proc.parameters.blockCount
  );

  const VOTING_SECTIONS = [
    {
      title: "Active votes",
      processes: activeProcesses,
      processesMessage: "Below are the votes belonging to the available tokens.",
      noProcessesMessage: "There are no active votes at this moment.",
    },
    {
      title: "Vote results",
      processes: endedProcesses,
      processesMessage: "Below are the results for votes related to your tokens.",
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
      <TopSection
        title="My Dashboard"
        description="Vote on the open processes and see the results of the
                        ones that already ended."
      />
      {VOTING_SECTIONS.map((section) => (
        <VoteSection
          {...section}
          key={section.title}
          loadingProcesses={loadingProcesses}
          tokenInfos={tokenInfos}
        />
      ))}
    </div>
  );
};

export const VoteSection = ({
  processes,
  tokenInfos,
  loadingProcesses,
  title,
  noProcessesMessage,
  processesMessage,
}) => {
  const Processes = () => {
    return useMemo(() => {
      return processes.map((proc) => {
        if (tokenInfos.size) {
          const token = tokenInfos.get(proc.tokenAddress);
          return <ProcessCard process={proc} token={token} />;
        }
      });
    }, [tokenInfos, processes]);
  };

  return (
    <VoteSectionContainer>
      <h2>{title}</h2>
      <LightText>{processes.length ? processesMessage : noProcessesMessage}</LightText>
      <TokenList>{loadingProcesses ? <Spinner /> : <Processes />}</TokenList>
    </VoteSectionContainer>
  );
};

const ProcessCard = (props: { process: ProcessInfo; token?: TokenInfo }) => {
  const proc = props.process;
  const icon = process.env.ETH_NETWORK_ID == "goerli" ? FALLBACK_TOKEN_ICON : props?.token.icon;

  return (
    <TokenCard
      key={proc.id}
      name={props?.token?.symbol}
      icon={icon}
      rightText={/*strDateDiff()*/ ""}
      href={proc?.id ? "/processes#/" + proc.id : ""}
    >
      <p>
        <strong>{limitedText(proc?.metadata?.title?.default, 35) || "No title"}</strong>
        <br />
        {limitedText(proc?.metadata?.description?.default) || "No description"}
        jaja
      </p>
    </TokenCard>
  );
};

export default DashboardPage;
