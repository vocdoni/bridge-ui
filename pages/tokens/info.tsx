import React, { useMemo } from "react";
import { Else, If, Then, Unless, When } from "react-if";
import { useBlockStatus, useProcesses } from "@vocdoni/react-hooks";
import { useUrlHash } from "use-url-hash";
import styled from "styled-components";

import { useToken } from "../../lib/hooks/tokens";
import { abbreviatedTokenAmount, shortAddress } from "../../lib/utils";
import { useScrollTop } from "../../lib/hooks/useScrollTop";
import { TokenInfo } from "../../lib/types";
import { EventType, trackEvent } from "../../lib/analytics";

import SectionTitle from "../../components/sectionTitle";
import { TokenLogo, VoteCard } from "../../components/token-card";
import { PrimaryButton } from "../../components/button";
import { IProcessSummary, ProcessMetadata } from "dvote-js";
import { LoadingRectangle } from "../../components/loading-rectangle";
import { ProposalTypeList } from "../../components/Modal/ProposalTypeList";
import { ActionTypes, useModal } from "../../components/Modal/context";
import { LightText, TokenList, VoteSectionContainer } from "../dashboard";

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
  background: ${({ theme }) => theme.backgroundGray.bg1};
  border-radius: 13px;
  text-align: center;
  font-size: 18px;

  @media ${({ theme }) => theme.screens.tablet} {
    padding: 10px;
    text-align: unset;
  }
`;

const Address = styled.h4`
  max-width: 200px;
  margin: 0;
  font-size: 18px;
  letter-spacing: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
`;

type VotingSectionProps = {
  allProcesses: {
    id: string;
    summary: IProcessSummary;
    metadata?: ProcessMetadata;
  }[];
  processes: string[];
  token: TokenInfo;
  loadingProcesses: boolean;
  title: string;
  noProcessesMessage: string;
  processesMessage: string;
};

const VoteSection = (params: VotingSectionProps) => {
  const {
    allProcesses,
    processes,
    token,
    loadingProcesses,
    title,
    noProcessesMessage,
    processesMessage,
  } = params;

  return (
    <VoteSectionContainer>
      <If condition={processes?.length}>
        <Then>
          <SectionTitle title={title} subtitle={processesMessage} />
          <TokenList>
            {processes.map((processId) => {
              const proc = allProcesses.find((proc) => proc.id == processId);
              const title = proc?.metadata?.title?.default || "(title)";
              return (
                <ProcessCard
                  key={processId}
                  id={processId}
                  title={title}
                  token={token}
                  loading={!proc?.metadata}
                />
              );
            })}
          </TokenList>
        </Then>
        <Else>
          <SectionTitle title={title} subtitle={processesMessage} />

          <When condition={loadingProcesses}>
            <LoadingRectangle message="Loading" />
          </When>
          <Unless condition={loadingProcesses}>
            <EmptySection>
              <LightText>{noProcessesMessage}</LightText>
            </EmptySection>
          </Unless>
        </Else>
      </If>
    </VoteSectionContainer>
  );
};

const ProcessCard = (props: { id: string; token: TokenInfo; title: string; loading?: boolean }) => {
  const { id, token, title, loading } = props;
  // TODO: Show a spinner when `loading` is set
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
  const tokenAddress = useUrlHash().substr(1);
  const { tokenInfo, loading: tokenLoading, error: tokenError } = useToken(tokenAddress);
  const processIds = tokenInfo?.processes || [];
  const { processes, loading: proposalsLoading, error: proposalsError } = useProcesses(processIds);
  const { blockStatus } = useBlockStatus();

  const blockNumber = blockStatus?.blockNumber || 0;
  const loading = tokenLoading || proposalsLoading;
  const { dispatch } = useModal();

  // Callbacks
  const onCreate = () => {
    trackEvent(EventType.NEW_PROPOSAL_CLICKED, {});
    dispatch({
      type: ActionTypes.OPEN_PROPOSAL_LIST,
    });
  };

  const upcomingProcesses = processIds.filter((id) => {
    const proc = processes.find((p) => p.id == id);
    if (!proc) return false;

    return blockNumber < proc?.summary?.startBlock;
  });
  const activeProcesses = processIds.filter((id) => {
    const proc = processes.find((p) => p.id == id);
    if (!proc) return false;

    return (
      blockNumber >= proc?.summary?.startBlock &&
      blockNumber < proc?.summary?.startBlock + proc?.summary?.blockCount
    );
  });
  const endedProcesses = processIds.filter((id) => {
    const proc = processes.find((p) => p.id == id);
    if (!proc) return false;

    return blockNumber >= proc?.summary?.startBlock + proc?.summary?.blockCount;
  });

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

  const amount = useMemo(() => {
    if (tokenInfo?.totalSupplyFormatted) {
      return abbreviatedTokenAmount(tokenInfo.totalSupplyFormatted);
    }
    return "-";
  }, [tokenInfo?.totalSupplyFormatted]);

  return (
    <>
      <ProposalTypeList />
      <HeaderContainer>
        <HeaderLeft>
          <TokenLogoContainer>
            <TokenLogo src={tokenInfo?.icon} />
          </TokenLogoContainer>
          <SectionTitle
            title="Token details"
            subtitle={`See the details of ${tokenInfo?.symbol}`}
          />
        </HeaderLeft>
        <PrimaryButton onClick={onCreate}>Create New Proposal</PrimaryButton>
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
            <InfoDescription>{amount}</InfoDescription>
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
