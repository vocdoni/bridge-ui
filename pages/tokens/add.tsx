import React, { useCallback, useState } from "react";
import { When } from "react-if";
import { CensusErc20Api } from "dvote-js";
import Router from "next/router";
import styled from "styled-components";
import { useWallet } from "use-wallet";
import { usePool } from "@vocdoni/react-hooks";

import { getTokenInfo, hasBalance, registerToken } from "../../lib/api";
import {
  NO_TOKEN_BALANCE,
  TOKEN_ADDRESS_INVALID,
  TOKEN_ALREADY_REGISTERED,
  USER_CANCELED_TX,
} from "../../lib/errors";
import { TokenInfo } from "../../lib/types";
import { useMessageAlert } from "../../lib/hooks/message-alert";
import { useSigner } from "../../lib/hooks/useSigner";
import { useStoredTokens } from "../../lib/hooks/tokens";
import { useScrollTop } from "../../lib/hooks/useScrollTop";
import { EventType, trackEvent } from "../../lib/analytics";
import { FORTY_DIGITS_HEX } from "../../lib/regex";
import { abbreviatedTokenAmount, shortAddress } from "../../lib/utils";

import { Spinner } from "../../components/spinner";
import SectionTitle from "../../components/sectionTitle";
import SearchWidget from "../../components/searchWidget";
import Button, { PrimaryButton, SecondaryButton } from "../../components/ControlElements/button";
import { ActionTypes, useModal } from "../../components/Modal/context";
import { VerticalSpace } from "../../components/verticalBuffer";

/* TODO reorganize and consolidate some of theese components into one file as they also appear on token/info */

const TokenSummary = styled.div`
  margin-top: 2em;
  display: flex;
  justify-content: space-between;
  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;
    align-items: center;
  }
`;

const Info = styled.div`
  max-width: 25%;
  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 100%;
    flex-direction: row;
    min-height: 80px;
    width: 180px;
    margin: 0 auto;
    word-break: break-word;
  }
`;

const TokenAttributeTitle = styled.p`
  height: 60px;
  margin-top: 9px;
  margin-bottom: 0;
  line-height: 27px;
  color: ${({ theme }) => theme.primary.p1};
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  @media ${({ theme }) => theme.screens.tablet} {
    height: unset;
  }
`;

const Description = styled.h4`
  font-size: 18px;
  letter-spacing: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Address = styled.h4`
  max-width: 200px;
  font-size: 18px;
  letter-spacing: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ButtonRow = styled.div`
  margin-top: 5em;

  display: flex;
  justify-content: space-around;

  & > * {
    margin-top: -3em;
  }
`;

const Content = styled.div`
  max-width: 844px;
  width: 100%;
`;

const WhiteSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 18%;
  background: ${({ theme }) => theme.blackAndWhite.w1};
  border-radius: 13px;
  @media ${({ theme }) => theme.screens.tablet} {
    box-sizing: border-box;
  }
`;

const CompatibleTokenNote = styled.p`
  background: #ecfaff;
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 500;
  font-size: 14px;
  text-align: center;

  @media ${({ theme }) => theme.screens.laptop} {
    text-align: left;
  }
`;

const CompatibilityNote = `The token contract must store balances in a mapping between the holder address and the full amount. For example: mapping (address => uint256) balance.
If you have problems registering your token you can reach us on our `;

const RegisterButton = ({
  registeringToken,
  alreadyRegistered,
  address,
  onSubmit,
  isConnected,
}) => (
  <ButtonRow>
    {registeringToken ? (
      <Button>
        <Spinner />
      </Button>
    ) : alreadyRegistered ? (
      <SecondaryButton href={address ? "/tokens/info#/" + address : ""}>
        Token is already registered
      </SecondaryButton>
    ) : (
      <PrimaryButton onClick={onSubmit}>
        {!isConnected ? "Connect wallet" : "Register token"}
      </PrimaryButton>
    )}
  </ButtonRow>
);

const TokenContainer = ({ symbol, name, totalSupplyFormatted, address }) => (
  <>
    <SectionTitle
      smallerTitle={true}
      title="Token contract details"
      subtitle="The following token will be registered. All token holders will be able to submit new proposals."
    />
    <TokenSummary>
      <Info>
        <TokenAttributeTitle>Token symbol</TokenAttributeTitle>
        <Description>{symbol}</Description>
      </Info>
      <Info>
        <TokenAttributeTitle>Token name</TokenAttributeTitle>

        <Description>{name}</Description>
      </Info>
      <Info>
        <TokenAttributeTitle>Total supply</TokenAttributeTitle>
        <Description>{abbreviatedTokenAmount(totalSupplyFormatted)}</Description>
      </Info>
      <Info>
        <TokenAttributeTitle>Token address</TokenAttributeTitle>
        <Address>{shortAddress(address)}</Address>
      </Info>
    </TokenSummary>
  </>
);

// MAIN COMPONENT
const TokenAddPage = () => {
  useScrollTop();
  const wallet = useWallet();
  const signer = useSigner();

  const { dispatch } = useModal();

  const { poolPromise } = usePool();
  const [formTokenAddress, setFormTokenAddress] = useState<string>("");
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [registeringToken, setRegisteringToken] = useState(false);
  const { setAlertMessage } = useMessageAlert();
  const { storedTokens, refresh: refreshStoredTokens, loading } = useStoredTokens();

  const isConnected = wallet.connector || wallet.account;
  const alreadyRegistered = storedTokens.some(
    (t) => t?.address.toLowerCase() == formTokenAddress.toLowerCase()
  );

  // CALLBACKS ===========================================================================

  const checkToken = async () => {
    if (loadingToken || !formTokenAddress || loading) return;
    try {
      if (!formTokenAddress.trim().match(FORTY_DIGITS_HEX)) {
        throw new Error(TOKEN_ADDRESS_INVALID);
      }

      setLoadingToken(true);
      const pool = await poolPromise;
      const newTokenInfo = await getTokenInfo(formTokenAddress.trim(), pool);

      setLoadingToken(false);
      setTokenInfo(newTokenInfo);
    } catch (error) {
      setLoadingToken(false);
      trackEvent(EventType.TOKEN_FETCHING_FAILED, { token_address: formTokenAddress.trim() });

      if (error?.message === TOKEN_ADDRESS_INVALID) setAlertMessage(TOKEN_ADDRESS_INVALID);
      else setAlertMessage("Could not fetch the contract details");
    }
  };

  const onSubmit = useCallback(async () => {
    if (!tokenInfo) return;
    if (!isConnected) {
      return dispatch({
        type: ActionTypes.OPEN_WALLET_LIST,
      });
    }

    try {
      setRegisteringToken(true);
      const holderAddress = wallet.account;
      const pool = await poolPromise;

      const hasBal = await hasBalance(tokenInfo.address, holderAddress, pool);
      if (!hasBal) throw new Error(NO_TOKEN_BALANCE);
      else if (await CensusErc20Api.isRegistered(tokenInfo.address, pool)) {
        throw new Error(TOKEN_ALREADY_REGISTERED);
      }

      // Register
      await registerToken(tokenInfo.address, pool, signer);
      await refreshStoredTokens();

      setRegisteringToken(false);
      setAlertMessage("The token has been successfully registered", "success");
      trackEvent(EventType.TOKEN_REGISTERED, { token_address: tokenInfo.address });

      Router.push("/tokens/info#/" + tokenInfo.address);
    } catch (error) {
      setRegisteringToken(false);

      // User cancels tx (e.g., by aborting signing process.) This is not registered as
      // "failure"
      if ((error?.message as string)?.includes("signature")) {
        trackEvent(EventType.TX_CANCELED, { event_canceled: "adding_token" });
        return setAlertMessage(USER_CANCELED_TX);
      }

      trackEvent(EventType.TOKEN_REGISTRATION_FAILED, {
        token_address: formTokenAddress.trim(),
        error: error?.message,
      });

      if (error?.message === NO_TOKEN_BALANCE) return setAlertMessage(NO_TOKEN_BALANCE);
      if (error?.message === TOKEN_ALREADY_REGISTERED)
        return setAlertMessage(TOKEN_ALREADY_REGISTERED);

      console.error(error?.message); //log unspecified errors.
      setAlertMessage("The token could not be registered");
    }
  }, [signer, wallet, tokenInfo]);

  // RENDER ==============================================================================

  return (
    <>
      <SectionTitle
        title="Register a new token"
        subtitle="Enter the details of any ERC-20 token and start submitting new proposals"
      />
      <WhiteSection>
        <Content>
          <SectionTitle
            smallerTitle={true}
            title="Token contract address"
            subtitle="Enter the address of the ERC-20 contract that you would like to register"
          />
          <SearchWidget
            onKeyDown={(ev) => (ev.key == "Enter" ? checkToken() : null)}
            onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
              setFormTokenAddress(ev.target.value)
            }
            onClick={loading || loadingToken ? undefined : checkToken}
            loading={loading || loadingToken}
          />
          <CompatibleTokenNote>
            {CompatibilityNote}
            <a target="_blank" rel="noopener noreferrer" href={"https://discord.gg/XBA56Rmp"}>
              Discord, on the #voice channel
            </a>
          </CompatibleTokenNote>
        </Content>
      </WhiteSection>
      <VerticalSpace repeats={2} />

      <When condition={!!tokenInfo}>
        <WhiteSection>
          <Content>
            <TokenContainer {...tokenInfo} />
            <RegisterButton
              registeringToken={registeringToken}
              alreadyRegistered={alreadyRegistered}
              onSubmit={onSubmit}
              address={tokenInfo?.address || ""}
              isConnected={isConnected}
            />
          </Content>
        </WhiteSection>
      </When>
    </>
  );
};

export default TokenAddPage;
