import React, { useEffect, useMemo } from "react";
import Spinner from "react-svg-spinner";
import styled from "styled-components";
import { useBlockHeight, usePool, useProcesses } from "@vocdoni/react-hooks";
import { useWallet } from "use-wallet";
import { useRouter } from "next/router";

import { TokenCard } from "../../components/token-card";
// import Select from 'react-select'
import { useStoredTokens } from "../../lib/hooks/tokens";
import { TokenInfo } from "../../lib/types";
import { limitedText } from "../../lib/utils";
import { FALLBACK_TOKEN_ICON } from "../../lib/constants";
import { TopSection } from "../../components/top-section";
import { useScrollTop } from "../../lib/hooks/useScrollTop";
import { IProcessInfo } from "dvote-js";

export const TokenList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;

  @media ${({ theme }) => theme.screens.mobileL} {
    margin-top: 10px;
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
  const { storedTokens, error: tokenListError, loading: tokenListLoading } = useStoredTokens();
  const processIds = storedTokens.filter(token => token?.address).map(token => token.address);
  const { processes, loading: processesLoading, error: processesError } = useProcesses(processIds);
  const { blockHeight } = useBlockHeight()

  const processList = [...processes.values()]

  useEffect(() => {
    if (!account) {
      router.replace("/");
    }
  }, [account]);

  const upcomingProcesses = processList.filter((proc) => blockHeight < proc.parameters.startBlock);
  const activeProcesses = processList.filter(
    (proc) =>
      blockHeight >= proc.parameters.startBlock &&
      blockHeight < proc.parameters.startBlock + proc.parameters.blockCount
  );
  const endedProcesses = processList.filter(
    (proc) => blockHeight >= proc.parameters.startBlock + proc.parameters.blockCount
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
          loadingProcesses={tokenListLoading || processesLoading}
          tokenInfos={storedTokens}
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

const ProcessCard = (props: { process: IProcessInfo; token?: TokenInfo }) => {
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
      </p>
    </TokenCard>
  );
};

export default DashboardPage;
