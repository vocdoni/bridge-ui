import React from "react";
import { useMemo } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { usePool } from "@vocdoni/react-hooks";
import { ChainUnsupportedError, ConnectionRejectedError, useWallet } from "use-wallet";
import { shortAddress } from "../lib/utils";
import { useModal, ActionTypes } from "./Modal/context";
import { CONNECTED_WALLET_ICON } from "../lib/constants";

const ButtonContainer = styled.div`
  margin: 15px auto;
  max-width: 300px;
  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 100%;
    text-align: center;
  }
`;

const ConnectWalletButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 173px;
  height: 45px;
  left: calc(50% - 173px/2 + 673.5px);
  top: calc(50% - 45px/2 - 749px);
  color: ${({ theme }) => theme.blackAndWhite.w1};
  font-weight: 500;
  font-size: 16px;
  background: ${({ theme }) =>
    `linear-gradient(${theme.gradients.primary.mg1.a}, ${theme.gradients.primary.mg1.c1}, ${theme.gradients.primary.mg1.c2});`};
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.cardShadow};
    background: linear-gradient(
      ${({ theme }) => theme.gradients.primary.mg1_soft.a},
      ${({ theme }) => theme.gradients.primary.mg1_soft.c1} 1.46%,
      ${({ theme }) => theme.gradients.primary.mg1_soft.c2} 99.99%,
      ${({ theme }) => theme.gradients.primary.mg1_soft.c3} 100%
    );
    transition: 300ms;
    transition-timing-function: ease-in-out;
    
  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 100%;
    text-align: center;
  }
`;

const ConnectedWalletButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 173px;
  height: 45px;
  left: calc(50% - 173px/2 + 673.5px);
  top: calc(50% - 45px/2 - 749px);
  color: ${({ theme }) => theme.blackAndWhite.b1};
  font-weight: 500;
  font-size: 16px;
  background: ${({ theme }) => theme.blackAndWhite.w1};

  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.cardShadow};
    transition: 300ms;
    transition-timing-function: ease-in-out;
    
  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 100%;
    text-align: center;
  }
`;

const ConnectedWalletIcon = styled.div`
  background: url(${CONNECTED_WALLET_ICON});
  position: asbsolute;
  width: 24px;
  height: 24px;
  margin-right: 10px;
`;

const TextLink = styled.p`
  color: ${({ theme }) => theme.primary.p1};
  text-align: center;
  cursor: pointer;
  margin-top: 0px;
  font-weight: 400;
  &:hover {
    color: ${({ theme }) => theme.gradients.primary.mg1_soft.c1};
  }
`;

const WalletAddress = ({ account }) => {
  return (
    <ButtonContainer>
      <ConnectedWalletButton>
        <ConnectedWalletIcon />
        {account && shortAddress(account)}
      </ConnectedWalletButton>
    </ButtonContainer>
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

    return isConnected ? "Connected" : "Connect account";
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
      reset();
      return;
    }

    openWallets();
  };

  if (isConnected) {
    return <WalletAddress account={account} />;
  }

  return (
    <ButtonContainer>
      <ConnectWalletButton onClick={handleButtonClick}>{label}</ConnectWalletButton>
    </ButtonContainer>
  );
};

export const ConnectTextButton = () => {
  const { dispatch } = useModal();

  const openWallets = () => {
    dispatch({
      type: ActionTypes.OPEN_WALLET_LIST,
    });
  };

  const handleButtonClick = async () => {
    openWallets();
  };

  return <TextLink onClick={handleButtonClick}>Connect account</TextLink>;
};
