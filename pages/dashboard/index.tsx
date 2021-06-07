import React, { useEffect } from "react";
import Spinner from "react-svg-spinner";
import styled from "styled-components";
import { useBlockHeight, useProcesses } from "@vocdoni/react-hooks";
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
import { IProcessSummary, ProcessMetadata } from "dvote-js";
import { Else, If, Then } from "react-if";

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

  useEffect(() => {
    if (!account) {
      router.replace("/");
    }
  }, [account]);

  const upcomingProcesses = processes.filter((proc) => blockHeight < proc.summary.startBlock);
  const activeProcesses = processes.filter(
    (proc) =>
      blockHeight >= proc.summary.startBlock &&
      blockHeight < (proc.summary.startBlock + proc.summary.blockCount)
  );
  const endedProcesses = processes.filter(
    (proc) => blockHeight >= (proc.summary.startBlock + proc.summary.blockCount)
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
          tokenInfos={storedTokens || []}
        />
      ))}
    </div>
  );
};

export const VoteSection = (props: {
  processes: { id: string; summary: IProcessSummary; metadata?: ProcessMetadata; }[],
  tokenInfos: TokenInfo[],
  loadingProcesses: boolean,
  title: string,
  noProcessesMessage: string,
  processesMessage: string
}) => {
  const {
    processes,
    tokenInfos,
    loadingProcesses,
    title,
    noProcessesMessage,
    processesMessage,
  } = props

  const Processes = () => {
    return <>
      {processes.map((proc) => {
        const token = tokenInfos.find(token => token.address == proc.summary.entityId);
        return <ProcessCard processId={proc.id} metadata={proc.metadata} token={token} />;
      })}
    </>;
  };

  return (
    <VoteSectionContainer>
      <h2>{title}</h2>
      <LightText>{processes.length ? processesMessage : noProcessesMessage}</LightText>
      <TokenList>{loadingProcesses ? <Spinner /> : <Processes />}</TokenList>
    </VoteSectionContainer>
  );
};

const ProcessCard = (props: { processId: string, metadata?: ProcessMetadata; token?: TokenInfo }) => {
  const icon = process.env.ETH_NETWORK_ID == "goerli" ? FALLBACK_TOKEN_ICON : props?.token.icon;

  return (
    <TokenCard
      key={props.processId}
      name={props?.token?.symbol}
      icon={icon}
      rightText={/*strDateDiff()*/ ""}
      href={props.processId ? "/processes#/" + props.processId : ""}
    >
      <p>
        <If condition={!!props.metadata}>
          <Then>
            <strong>{limitedText(props.metadata?.title?.default, 35) || "(title)"}</strong>
            <br />
            {limitedText(props.metadata?.description?.default) || "(description)"}
          </Then>
          <Else>
            <Spinner />
          </Else>
        </If>
      </p>
    </TokenCard>
  );
};

export default DashboardPage;
