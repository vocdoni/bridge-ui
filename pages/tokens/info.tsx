import React, { useState, useEffect, useMemo } from "react";

import { ProcessInfo, useBlockStatus, usePool, useProcesses } from "@vocdoni/react-hooks";
import { useToken } from "../../lib/hooks/tokens";
import { useUrlHash } from "use-url-hash";
import { TokenLogo, VoteCard } from "../../components/token-card";
import { PrimaryButton } from "../../components/button";
import Router from "next/router";
import { getProcessList } from "../../lib/api";
import Spinner from "react-svg-spinner";
import { useMessageAlert } from "../../lib/hooks/message-alert";
import styled from "styled-components";
import { shortAddress } from "../../lib/utils";
import { LightText, TokenList, VoteSectionContainer } from "../dashboard";
import SectionTitle from "../../components/sectionTitle";
import { useScrollTop } from "../../lib/hooks/useScrollTop";
import { TokenInfo } from "../../lib/types";
import { StyledSpinner } from "./add";

const HeaderContainer = styled.div`
  margin-bottom: 45px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  @media ${({ theme }) => theme.screens.tablet} {
    width: 100%;
  }
`;

const WhiteSection = styled.div`
  padding: 42px 64px;
  margin-bottom: 60px;
  background: ${({ theme }) => theme.blackAndWhite.w1};
  border-radius: 13px;
  @media ${({ theme }) => theme.screens.tablet} {
    margin-bottom: 0px;
    padding: 20px 64px;
  }
`;

const RowSummary = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;

  @media ${({ theme }) => theme.screens.tablet} {
    justify-content: center;
    flex-direction: column;
  }
`;

const Info = styled.div`
  padding: 0 20px;

  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: row;
    min-height: 80px;
    width: 180px;
    margin: 0 auto;
    word-break: break-word;
  }
`;

const TokenAttribute = styled.p`
  margin-top: 9px;
  margin-bottom: 0;
  color: ${({ theme }) => theme.primary.p1};
  line-height: 27px;
  font-size: 18px;
  font-weight: 400;
`;

const EmptySection = styled.div`
  padding: 60px;
  background: #eef4fb;
  border-radius: 13px;
  text-align: center;
  font-size: 18px;

  @media ${({ theme }) => theme.screens.tablet} {
    padding: 10px;
    text-align: unset;
  }
`;

const Address = styled.h4`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  margin: 0;
  font-size: 18px;
  letter-spacing: 0;
`;

const InfoDescription = styled.h4`
  font-size: 20px;
  letter-spacing: 0;
  margin-top: 0;
  margin-bottom: 30px;
`;

const TokenLogoContainer = styled.div`
  margin-right: 20px;
  margin-top: 25px;
`


type VotingSectionProps = {
  allProcesses: Map<string, ProcessInfo>,
  processes: string[],
  token: TokenInfo,
  loadingProcesses: boolean,
  title: string,
  noProcessesMessage: string,
  processesMessage: string,
};

const VoteSection = (params: VotingSectionProps) => {
  const { allProcesses, processes, token, loadingProcesses, title, noProcessesMessage, processesMessage } = params;

  const processList = <>
    {processes.map((processId) => {
      const title = allProcesses.get(processId)?.metadata?.title?.default || "No title";
      return <ProcessCard key={processId} id={processId} title={title} token={token} />;
    })}
  </>

  return (
    <VoteSectionContainer>
      {processes.length ? (
        <>
          <SectionTitle title={title} subtitle={processesMessage} />
          <TokenList>{loadingProcesses ? <Spinner /> : processList}</TokenList>
        </>
      ) : (
        <>
          <SectionTitle title={title} />
          <EmptySection>
            <LightText>{processes.length ? processesMessage : noProcessesMessage}</LightText>
          </EmptySection>
        </>
      )}
    </VoteSectionContainer>
  );
};

const ProcessCard = ({ id, token, title }) => {
  return (
    <VoteCard
      name={token?.name}
      symbol={token?.symbol}
      icon={token?.icon}
      href={id ? "/processes#/" + id : ""}
      key={id}
    >
      {title}
    </VoteCard>
  );
};

// MAIN COMPONENT
const TokenPage = () => {
  useScrollTop();
  const { poolPromise } = usePool();
  const tokenAddress = useUrlHash().substr(1);
  const { tokenInfo, loading: tokenLoading, error: tokenError } = useToken(tokenAddress);
  const [loadingProcessList, setLoadingProcessList] = useState(true);
  const [processIds, setProcessIds] = useState<string[]>([]);
  const { processes, error: proposalsError, loading: proposalsLoading } = useProcesses(processIds || []);
  const { blockStatus } = useBlockStatus();
  const { setAlertMessage } = useMessageAlert();

  const blockNumber = blockStatus?.blockNumber || 0;
  const loading = tokenLoading || proposalsLoading || loadingProcessList

  // TODO: Use proposalsError, proposalsLoading

  // Effects
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => updateProcessIds, 1000 * 60);
    updateProcessIds();

    // Done
    return () => clearInterval(interval);
  }, [tokenAddress]);

  // Loaders

  const updateProcessIds = () => {
    if (!tokenAddress) return;
    setLoadingProcessList(true);

    poolPromise
      .then((pool) => getProcessList(tokenAddress, pool))
      .then((ids) => {
        setLoadingProcessList(false);
        setProcessIds(ids);
      })
      .catch((err) => {
        setLoadingProcessList(false);

        console.error(err);
        setAlertMessage("The list of processes could not be loaded");
      });
  };

  // Callbacks

  const onCreateProcess = () => {
    if (!tokenAddress) return;
    Router.push("/processes/new#/" + tokenAddress);
  };

  const upcomingProcesses = processIds.filter(
    (id) => processes.has(id) && blockNumber < processes.get(id).parameters.startBlock
  );
  const activeProcesses = processIds.filter(
    (id) =>
      processes.has(id) &&
      blockNumber >= processes.get(id).parameters.startBlock &&
      blockNumber <
      processes.get(id).parameters.startBlock + processes.get(id).parameters.blockCount
  );
  const endedProcesses = processIds.filter(
    (id) =>
      processes.has(id) &&
      blockNumber >=
      processes.get(id).parameters.startBlock + processes.get(id).parameters.blockCount
  );

  // This exact logic is being done in dashboard/index.tsx
  // @TODO: Convert this logic into a hook so we apply some DRY
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

  const address = useMemo(() => {
    if (tokenInfo?.address) {
      return shortAddress(tokenInfo.address);
    }
    return "-";
  }, [tokenInfo?.address]);

  return (
    <>
      <HeaderContainer>
        <HeaderLeft>
          <TokenLogoContainer>
            <TokenLogo src={tokenInfo?.icon}  />
          </TokenLogoContainer>
          <SectionTitle title="Token details" subtitle={`See the details of ${tokenInfo?.symbol}`} />
        </HeaderLeft>
        <PrimaryButton onClick={() => onCreateProcess()}>
          Create New Proposal
        </PrimaryButton>
      </HeaderContainer>

      <WhiteSection>
        <RowSummary>
          <Info>
            <TokenAttribute>Token symbol</TokenAttribute>
            <InfoDescription>{tokenInfo?.symbol || "-"}</InfoDescription>
          </Info>
          <Info>
            <TokenAttribute>Token name</TokenAttribute>
            <InfoDescription>{tokenInfo?.name || "-"}</InfoDescription>
          </Info>
          <Info>
            <TokenAttribute>Total supply</TokenAttribute>
            <InfoDescription>{tokenInfo?.totalSupplyFormatted || "-"}</InfoDescription>
          </Info>
          <Info>
            <TokenAttribute>Token address</TokenAttribute>
            <Address>{address}</Address>
          </Info>
        </RowSummary>
      </WhiteSection>

      {VOTING_SECTIONS.map((section, i) => (
        <VoteSection
          {...section}
          key={i}
          allProcesses={processes}
          loadingProcesses={loading}
          token={tokenInfo}
        />
      ))}
    </>
  );
};

export default TokenPage;
