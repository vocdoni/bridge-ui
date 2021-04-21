import React from "react";
import { useMemo } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import {
  Button as AragonButton,
  IconEthereum,
  IconPower,
  AddressField,
  LoadingRing,
} from "@aragon/ui";
import Button from "../components/button";
import { usePool } from "@vocdoni/react-hooks";
import { ChainUnsupportedError, ConnectionRejectedError, useWallet } from "use-wallet";

import { useModal, ActionTypes } from "./Modal/context";

const ButtonContainer = styled.div`
  margin: 15px auto;
  max-width: 300px;
  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 100%;
    text-align: center;
  }
`;

const AddressContainer = styled.div`
  margin-bottom: 15px;
  max-width: 260px;
  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 100%;
    text-align: center;
  }
`;

const MyButton = styled(Button)`
  max-width: 300px;
  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 100%;
  }
`;

const WalletAddress = ({ reset, account }) => {
  const icon = <AragonButton icon={<IconPower />} size="mini" onClick={reset} />;
  return (
    <AddressContainer>
      <AddressField address={account} icon={icon} />
    </AddressContainer>
  );
};

export const ConnectButton = () => {
  const { dispatch } = useModal();
  const { pathname, push } = useRouter();
  const { status, networkName, reset, error, account } = useWallet();
  const { loading: poolLoading } = usePool();

  const openWallets = () => {
    dispatch({
      type: ActionTypes.OPEN_WALLET_LIST,
    });
  };

  const isConnected = status == "connected";
  const inLanding = pathname === "/";
  const loadingOrConnecting = poolLoading || status === "connecting";

  const label = useMemo(() => {
    if (poolLoading) return "Connecting to Vocdoni";
    if (status === "connecting") return "Connecting to " + networkName;

    if (error instanceof ChainUnsupportedError) {
      return networkName + " is not enabled";
    }

    if (error instanceof ConnectionRejectedError) {
      return "Wallet connection rejected";
    }

    return isConnected ? "Show dashboard" : "Connect to Wallet";
  }, [poolLoading, status, error]);

  const mode = useMemo(() => {
    if (error) return "negative";
    if (inLanding) return "strong";

    return "normal";
  }, [error, loadingOrConnecting]);

  const handleButtonClick = async () => {
    if (loadingOrConnecting) {
      reset();
      return;
    }

    if (inLanding && isConnected) {
      push("/dashboard");
      return;
    }

    openWallets();
  };

  if (isConnected && !inLanding) {
    return <WalletAddress account={account} reset={reset} />;
  }

  return (
    <ButtonContainer>
      <MyButton
        wide
        icon={loadingOrConnecting ? <LoadingRing /> : <IconEthereum />}
        mode={mode}
        onClick={handleButtonClick}
        label={label}
      />
    </ButtonContainer>
  );
};
