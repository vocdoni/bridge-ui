import React from "react";
import { useMemo } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { usePool } from "@vocdoni/react-hooks";
import { ChainUnsupportedError, ConnectionRejectedError, useWallet } from "use-wallet";
import { shortAddress } from "../lib/utils";
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
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 173px;
  height: 45px;
  left: calc(50% - 173px/2 + 673.5px);
  top: calc(50% - 45px/2 - 749px);
  margin-top: 15px;
  margin-right: 60px;
  color: ${({ theme }) => theme.blackAndWhite.w1};
  font-weight: 600;
  font-size: 16px;
  background: ${({ theme }) =>
    `linear-gradient(${theme.gradients.primary.mg1.a}, ${theme.gradients.primary.mg1.c1}, ${theme.gradients.primary.mg1.c2});`};

  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  cursor: pointer;
  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 100%;
    text-align: center;
  }
`;

const MyButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 173px;
  height: 45px;
  left: calc(50% - 173px/2 + 673.5px);
  top: calc(50% - 45px/2 - 749px);
  margin-right: 60px;
  color: ${({ theme }) => theme.blackAndWhite.w1};
  font-weight: 600;
  font-size: 16px;
  background: ${({ theme }) =>
    `linear-gradient(${theme.gradients.primary.mg1.a}, ${theme.gradients.primary.mg1.c1}, ${theme.gradients.primary.mg1.c2});`};

  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  cursor: pointer;
  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 100%;
  }
`;

const WalletAddress = ({ reset, account }) => {
  return (
    <AddressContainer>
      {shortAddress(account)}
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
    if (poolLoading) return "Connecting...";
    if (status === "connecting") return "Connecting to " + networkName;

    if (error instanceof ChainUnsupportedError) {
      return networkName + " is not enabled";
    }

    if (error instanceof ConnectionRejectedError) {
      return "Wallet connection rejected";
    }

    return isConnected ? "Show dashboard" : "Connect account";
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
        onClick={handleButtonClick}
      >{label}</MyButton>
    </ButtonContainer>
  );
};
