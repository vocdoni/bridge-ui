import React, { useState, useEffect, useMemo } from "react";
import { ProcessMetadata, VotingApi } from "dvote-js";

import { usePool, useProcesses } from "@vocdoni/react-hooks";
import { useToken } from "../../lib/hooks/tokens";
import { useUrlHash } from "use-url-hash";
import TokenCard from "../../components/token-card";
import { Button } from "@aragon/ui";
import Router from "next/router";
import { getProcessList, getTokenProcesses } from "../../lib/api";
import { FALLBACK_TOKEN_ICON } from "../../lib/constants";
import Spinner from "react-svg-spinner";
import { useMessageAlert } from "../../lib/hooks/message-alert";
import styled from "styled-components";
import { TopSection } from "../../components/top-section";
import { shortAddress } from "../../lib/util";
import { LightText, TokenList, VoteSectionContainer } from "../dashboard";
import { title } from "node:process";

const RowSummary = styled.div`
  margin-top: 2em;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;
    text-align: center;
  }
`;

const Info = styled.div`
  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: row;
    height: 80px;
  }
`;

const InfoTitle = styled.p`
  font-weight: 500;
  color: ${({ theme }) => theme.accent1};
`;

const Address = styled.h4`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  font-size: 18px;
  letter-spacing: 0;
  @media ${({ theme }) => theme.screens.tablet} {
    text-align: center;
    max-width: 100%;
    overflow: none;
  }
`;

const InfoDescription = styled.h4`
  font-size: 18px;
  letter-spacing: 0;
`;

const VoteSection = ({
  allProcesses,
  processes,
  token,
  loadingProcesses,
  title,
  noProcessesMessage,
  processesMessage,
}) => {
  const Processes = () =>
    useMemo(() => {
      return processes.map((processId) => {
        const title = allProcesses.get(processId).metadata.title.default || "No title";
        return (<ProcessCard id={processId} title={title} token={token} />);
      });
    }, [processes]);

  return (
    <VoteSectionContainer>
      <h2>{title}</h2>
      <LightText>{processes.length ? processesMessage : noProcessesMessage}</LightText>
      <TokenList>{loadingProcesses ? <Spinner /> : <Processes />}</TokenList>
    </VoteSectionContainer>
  );
};

const ProcessCard = ({ id, token, title }) => {
  const icon = process.env.ETH_NETWORK_ID == "goerli" ? FALLBACK_TOKEN_ICON : token.icon;
  return (
    <TokenCard
      name={token?.symbol}
      icon={icon}
      rightText=""
      href={id ? "/processes#/" + id : ""}
      key={id}
    >
      <p>{title}</p>
    </TokenCard>
  );
};

// MAIN COMPONENT
const TokenPage = () => {
  const { poolPromise } = usePool();
  const tokenAddr = useUrlHash().substr(1);
  const [loadingProcessList, setLoadingProcessList] = useState(true);
  const [blockNumber, setBlockNumber] = useState(-1);
  const [processIds, setProcessIds] = useState([] as string[]);
  const { processes, error, loading: loadingProcessesDetails } = useProcesses(processIds || []);
  const token = useToken(tokenAddr);
  const { setAlertMessage } = useMessageAlert();

  // Effects

  useEffect(() => {
    const interval = setInterval(() => updateBlockHeight, 1000 * 13);
    updateBlockHeight();

    // Done
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => updateProcessIds, 1000 * 60);
    updateProcessIds();

    // Done
    return () => clearInterval(interval);
  }, [tokenAddr]);

  // Loaders

  const updateBlockHeight = () => {
    poolPromise
      .then((pool) => VotingApi.getBlockHeight(pool))
      .then((num) => setBlockNumber(num))
      .catch((err) => console.error(err));
  };
  const updateProcessIds = () => {
    if (!tokenAddr) return;
    setLoadingProcessList(true);

    poolPromise
      .then((pool) => getProcessList(tokenAddr, pool))
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

  const onCreateProcess = (tokenAddress: string) => {
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
    if (token?.address) {
      return shortAddress(token.address);
    }
    return "-";
  }, [token?.address]);

  return (
    <div>
      <TopSection
        title={"Token details"}
        description={`See the details of ${token?.symbol || "the token"}`}
        Action={() => (
          <Button mode="strong" wide onClick={() => onCreateProcess(token.address)}>
            Create a governance process
          </Button>
        )}
      />

      <RowSummary>
        <Info>
          <InfoTitle>Token symbol</InfoTitle>
          <InfoDescription>{token?.symbol || "-"}</InfoDescription>
        </Info>
        <Info>
          <InfoTitle>Token name</InfoTitle>
          <InfoDescription>{token?.name || "-"}</InfoDescription>
        </Info>
        <Info>
          <InfoTitle>Total supply</InfoTitle>
          <InfoDescription>{token?.totalSupplyFormatted || "-"}</InfoDescription>
        </Info>
        <Info>
          <InfoTitle>Token address</InfoTitle>
          <Address>{address}</Address>
        </Info>
      </RowSummary>

      {VOTING_SECTIONS.map((section, i) => (
        <VoteSection
          {...section}
          key={`${i}_vote`}
          allProcesses={processes}
          loadingProcesses={loadingProcessList}
          token={token}
        />
      ))}
    </div>
  );
};

export default TokenPage;
