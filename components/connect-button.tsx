import React from "react";
import { useMemo } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { usePool } from "@vocdoni/react-hooks";
import { ChainUnsupportedError, ConnectionRejectedError, useWallet } from "use-wallet";
import { shortAddress } from "../lib/utils";
import { useModal, ActionTypes } from "./Modal/context";
import { WALLET_IDENTICON } from "../lib/constants";

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 100%;
  }
`;

const ConnectWalletButton = styled.div<{ wide: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: ${({ wide }) => (wide ? "173px" : "100%")};
  height: 45px;
  color: ${({ theme }) => theme.blackAndWhite.w1};
  font-weight: 500;
  font-size: 16px;
  background: ${({ theme }) =>
    `linear-gradient(${theme.gradients.primary.mg1.a}, ${theme.gradients.primary.mg1.c1}, ${theme.gradients.primary.mg1.c2});`};
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  z-index: 1;

  main &:before {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 8px;
    box-shadow: ${({ theme }) => theme.shadows.cardShadow};
    background: linear-gradient(
      ${({ theme }) => theme.gradients.primary.mg1_soft.a},
      ${({ theme }) => theme.gradients.primary.mg1_soft.c1} 1.46%,
      ${({ theme }) => theme.gradients.primary.mg1_soft.c2} 99.99%,
      ${({ theme }) => theme.gradients.primary.mg1_soft.c3} 100%
    );
    transition: opacity 300ms ease-in-out;
    opacity: 0;
    z-index: -1;
  }
  &:hover:before {
    opacity: 1;
  }
  @media ${({ theme }) => theme.screens.tablet} {
    width: 100%;
  }
`;

const ConnectedWalletButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 173px;
  height: 45px;
  left: calc(50% - 173px / 2 + 673.5px);
  top: calc(50% - 45px / 2 - 749px);
  color: ${({ theme }) => theme.blackAndWhite.b1};
  font-weight: 500;
  font-size: 16px;
  background: ${({ theme }) => theme.blackAndWhite.w1};
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.cardShadow};
    transition: 300ms ease-in-out;
  }
  @media ${({ theme }) => theme.screens.tablet} {
    width: 100%;
  }
`;

const ConnectedWalletIcon = styled.div`
  background: url(${WALLET_IDENTICON});
  position: asbsolute;
  width: 24px;
  height: 24px;
  margin-right: 10px;
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

export const ConnectButton = ({ wide }) => {
  const { dispatch } = useModal();
  const { pathname, push } = useRouter();
  const { status, networkName, reset, error, account } = useWallet();
  const { loading: poolLoading } = usePool();

  const openWallets = () => dispatch({ type: ActionTypes.OPEN_WALLET_LIST });

  const isConnected = status == "connected";
  const inLanding = pathname === "/";
  const loadingOrConnecting = poolLoading || status === "connecting";

  const label = useMemo(() => {
    if (poolLoading) return "Connecting...";
    if (status === "connecting") return "Connecting to " + networkName;
    if (error instanceof ChainUnsupportedError) return networkName + " is not enabled";
    if (error instanceof ConnectionRejectedError) return "Wallet connection rejected";

    return isConnected ? "Connected" : "Connect Wallet";
  }, [poolLoading, status, error]);

  const handleButtonClick = async () => {
    if (loadingOrConnecting || (inLanding && isConnected)) {
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
      <ConnectWalletButton wide={wide} onClick={handleButtonClick}>
        {label}
      </ConnectWalletButton>
    </ButtonContainer>
  );
};

export const ConnectWalletLink = () => {
  const { dispatch } = useModal();

  const openWallets = () => dispatch({ type: ActionTypes.OPEN_WALLET_LIST });

  return <TextLink onClick={openWallets}>Connect Wallet</TextLink>;
};
