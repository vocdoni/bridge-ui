import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import { useWallet } from "use-wallet";

import { Modal } from ".";
import { useMessageAlert } from "../../lib/hooks/message-alert";
import { WALLETS } from "../../lib/wallets";
import { ActionTypes, useModal } from "./context";

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #dfe3e8;
`;

const ModalTitle = styled.div`
  flex-direction: column;
  padding-bottom: 10px;
  box-sizing: border-box;
  margin-top: 10px;
  padding-left: 16px;
  font-family: 'Manrope', sans-serif !important;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  color: #637381;
`;

const Body = styled.div`
  height: 100%;
  padding: 15px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

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
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};;
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
  font-family: 'Manrope', sans-serif !important;
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

const ExternalLinkOption = styled.a`
  display: flex;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  font-family: 'Manrope', sans-serif !important;
  font-style: normal;
  font-weight: 300;
  font-size: 12px;
  color: #637381;
`;

const CloseIcon = styled.div`
  flex-direction: column;
  margin-top: 10px;
  padding-right: 16px;
  cursor: pointer;
`;

const DontHaveAccount = styled.a`
  text-decoration: none;
  font-family: 'Manrope', sans-serif !important;
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

const HARDWARE_WALLETS_METAMASK_ARTICLE =
  "https://metamask.zendesk.com/hc/en-us/articles/360020394612-How-to-connect-a-Trezor-or-Ledger-Hardware-Wallet";

export const WalletList = () => {
  const { connect, error, reset } = useWallet();
  const { push, pathname } = useRouter();
  const { state, dispatch } = useModal();
  const { setAlertMessage } = useMessageAlert();

  const inLanding = pathname === "/";

  const closeModal = () => {
    dispatch({
      type: ActionTypes.CLOSE,
    });
  };

  const handleConnection = async (wallet) => {
    // @TODO: Remove this when ledger and trezor are implemented in useWallet
    if (wallet === "ledger" || wallet === "trezor") return;
    try {
      await connect(wallet);
      if (!error && inLanding) reset();
      closeModal();
    } catch (e) {
      reset();
      if (e.message.includes("Unsupported chainId")) {
        setAlertMessage(`${wallet} is not supported on current chain`);
      }
    }
  };
  return (
    /* Reducing the modal container height from 565px to 225px until wallet providers are properly tested. */
    <Modal open={state.walletList.open} height={225} width={452}>
      <ModalContainer>
        <Header>
          <ModalTitle>USE ACCOUNT FROM</ModalTitle>
          <CloseIcon onClick={closeModal}>
            <img src="/media/close.svg" />
          </CloseIcon>
        </Header>
        <Body>
          {Object.keys(WALLETS).map((wallet) => {
            const { connector, name } = WALLETS[wallet];
            const Option = () => (
              <WalletOption onClick={() => handleConnection(connector)}>
                <WalletLogo src={`/media/wallets/${connector}.svg`} />
                <WalletName>{name}</WalletName>
              </WalletOption>
            );
            return (
              <OptionContainer key={"wallet_" + wallet}>
                {/* @TODO: Remove this when ledger and trezor are implemented in useWallet */}
                {name === "Ledger" || name === "Trezor" ? (
                  <ExternalLinkOption
                    rel="noreferrer noopener"
                    target="_blank"
                    href={HARDWARE_WALLETS_METAMASK_ARTICLE}
                  >
                    <Option />
                  </ExternalLinkOption>
                ) : (
                  <Option />
                )}
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
      </ModalContainer>
    </Modal>
  );
};
