import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useWallet } from "use-wallet";

import { WalletModal } from ".";
import { identifyUser } from "../../lib/analytics";
import { useMessageAlert } from "../../lib/hooks/message-alert";
import { WALLETS } from "../../lib/constants/wallets";
import { ActionTypes, useModal } from "./context";
import { CloseIcon, ModalHeader, ModalLayout, ModalTitle } from "./styled";

const Body = styled.div`
  height: 100%;
  padding: 15px;
  display: flex;
  flex-wrap: wrap;
  /* Modified content justification from space-between to center until wallet providers are properly tested. */
  justify-content: center;

  @media ${({ theme }) => theme.screens.mobileL} {
    overflow-y: auto;
    justify-content: center;
    & > div:last-child {
      padding-bottom: 20px;
    }
  }
`;

const WalletOption = styled.div`
  width: 100%;
  height: 100px;
  border-radius: 8px;
  text-align: center;
  white-space: normal;
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  display: flex;
  flex-direction: column;
  align-items: center;
  @media ${({ theme }) => theme.screens.tablet} {
    margin-top: 10px;
  }
`;

const WalletName = styled.h4`
  display: flex;
  margin-top: 10px;
  color: #25314d;
  font-family: "Manrope", sans-serif !important;
  font-style: normal;
  font-weight: 300;
  font-size: 20px;
`;

const WalletLogo = styled.img`
  width: 40px;
  height: 40px;
  display: flex;
  margin-top: 10px;
`;

const OptionContainer = styled.div`
  height: 104px;
  width: 204px;
  cursor: pointer;
  margin-top: 10px;
`;

const DontHaveAccount = styled.a`
  text-decoration: none;
  font-family: "Manrope", sans-serif !important;
  font-style: normal;
  font-weight: 300;
  font-size: 18px;
  color: #3361eb;
  display: flex;
  margin: auto;
  margin-bottom: 10px;
  cursor: pointer;
  padding-top: 20px;
  @media ${({ theme }) => theme.screens.mobileL} {
    padding-top: 20px;
    margin-bottom: 0px;
  }
`;

export const WalletList = () => {
  const { connect, error, reset, status, account, networkName, connector } = useWallet();
  const { state, dispatch } = useModal();
  const { setAlertMessage } = useMessageAlert();
  const [firstId, setFirstId] = useState(true);

  const closeModal = () => {
    dispatch({
      type: ActionTypes.CLOSE_WALLET_LIST,
    });
  };

  // NOTE This hook is necessary to set potential errors generated during use-wallet's
  // connect(...) method. They are extracted into this hook because (for some reason),
  // the errors are not available right after the execution of connect(). [VR 25-05-2021]
  useEffect(() => {
    if (!error) return;
    switch (error?.name) {
      case "ConnectionRejectedError":
        setAlertMessage("You rejected the connection attempt", "warning");
        break;
      case "ChainUnsupportedError":
        setAlertMessage("This chain is not supported. Please set your wallet to Mainnet");
        break;
      default:
        setAlertMessage("Could not connect to the selected wallet");
        break;
    }
  }, [error]);

  useEffect(() => {
    /* NOTE This logic is needed to ensure identification event is sent only once. */
    if (status === "connected" && firstId) {
      setFirstId(false);
      identifyUser(account, networkName, connector);
    }
  }, [status]);

  const handleConnection = async (wallet) => {
    try {
      await connect(wallet);
      closeModal();
      reset();
    } catch (error) {
      console.error(error);
    }
    // return connect(wallet)
    //   .then(() => {
    //     closeModal();
    //     reset();
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   });
  };

  return (
    <WalletModal isOpen={state.walletList.open} width={452}>
      <ModalLayout>
        <ModalHeader>
          <ModalTitle>USE ACCOUNT FROM</ModalTitle>
          <CloseIcon onClick={closeModal}>
            <img src="/media/close.svg" />
          </CloseIcon>
        </ModalHeader>
        <Body>
          {Object.keys(WALLETS).map((wallet) => {
            const { connector, name } = WALLETS[wallet];
            return (
              <OptionContainer key={"wallet_" + wallet}>
                <WalletOption onClick={() => handleConnection(connector)}>
                  <WalletLogo src={`/media/wallets/${connector}.svg`} />
                  <WalletName>{name}</WalletName>
                </WalletOption>
              </OptionContainer>
            );
          })}
          <DontHaveAccount
            rel="noreferrer noopener"
            target="_blank"
            href={"https://ethereum.org/en/wallets/"}
          >
            {"Don't have an Ethereum account?"}
          </DontHaveAccount>
        </Body>
      </ModalLayout>
    </WalletModal>
  );
};
