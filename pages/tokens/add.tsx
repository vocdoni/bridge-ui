import React, { forwardRef, useCallback, useState } from "react";
import { Case, Default, Else, If, Switch, Then, When } from "react-if";
import { CensusErc20Api } from "dvote-js";
import Router from "next/router";
import styled from "styled-components";
import { useWallet } from "use-wallet";
import { usePool } from "@vocdoni/react-hooks";

import { getTokenInfo, hasBalance, registerToken } from "../../lib/api";
import {
  NoTokenBalanceError,
  TokenAddressInvalidError,
  TokenAlreadyRegisteredError,
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
import { theme } from "../../theme";
import { ETHERSCAN_RINKEBY } from "../../lib/constants";

const TokenSummary = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  background: ${({ theme }) => theme.grayScale.g1};
  padding: 24px;
  border-radius: 13px;

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
  margin-top: 0;
  margin-bottom: 0;
  line-height: 27px;
  color: ${({ theme }) => theme.grayScale.g5};
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
`;

const TokenAttributeDescription = styled.h4`
  margin-top: 8px;
  margin-bottom: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Address = styled(TokenAttributeDescription)`
  max-width: 200px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;

  & > :not(:last-child) {
    margin-right: 16px;
  }
  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;

    & > :not(:last-child) {
      margin-right: unset;
      margin-bottom: 8px;
    }
  }
`;

const WhiteSection = styled.div`
  padding: ${({ theme }) => theme.margins.desktop.horizontal};
  padding-top: 0;
  background: ${({ theme }) => theme.blackAndWhite.w1};
  border-radius: 13px;

  @media ${({ theme }) => theme.screens.tablet} {
    padding: ${({ theme }) => theme.margins.desktop.horizontal};
    padding-top: 0;
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

const ButtonsRow = ({
  registeringToken,
  alreadyRegistered,
  address,
  onSubmit,
  isConnected,
  onRevalidate,
}) => (
  <ButtonsContainer>
    <Switch>
      <Case condition={registeringToken}>
        <Button>
          <Spinner />
        </Button>
      </Case>
      <Case condition={alreadyRegistered}>
        <PrimaryButton href={address ? "/tokens/info#/" + address : ""}>
          Token is already registered
        </PrimaryButton>
        <SecondaryButton onClick={onRevalidate}>Validate another token</SecondaryButton>
      </Case>
      <Default>
        <PrimaryButton onClick={onSubmit}>
          {!isConnected ? "Connect wallet" : "Register token"}
        </PrimaryButton>
        <SecondaryButton onClick={onRevalidate}>Validate another token</SecondaryButton>
      </Default>
    </Switch>
  </ButtonsContainer>
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
        <TokenAttributeDescription>{symbol}</TokenAttributeDescription>
      </Info>
      <Info>
        <TokenAttributeTitle>Token name</TokenAttributeTitle>
        <TokenAttributeDescription>{name}</TokenAttributeDescription>
      </Info>
      <Info>
        <TokenAttributeTitle>Total supply</TokenAttributeTitle>
        <TokenAttributeDescription>
          {abbreviatedTokenAmount(totalSupplyFormatted)}
        </TokenAttributeDescription>
      </Info>
      <Info>
        <TokenAttributeTitle>Token address</TokenAttributeTitle>
        {/* TODO insert copy icon (and use the same links as in header?) [VR 30-06-2021] */}
        <a target="_blank" rel="noopener noreferrer" href={`${ETHERSCAN_RINKEBY}${address}`}>
          <Address>{shortAddress(address)}</Address>
        </a>
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
        throw new TokenAddressInvalidError();
      }

      setLoadingToken(true);
      const pool = await poolPromise;
      const newTokenInfo = await getTokenInfo(formTokenAddress.trim(), pool);

      setLoadingToken(false);
      setTokenInfo(newTokenInfo);
    } catch (error) {
      setLoadingToken(false);
      trackEvent(EventType.TOKEN_FETCHING_FAILED, { token_address: formTokenAddress.trim() });

      if (error instanceof TokenAddressInvalidError) setAlertMessage(error.message);
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
      if (!hasBal) throw new NoTokenBalanceError(tokenInfo.symbol);
      else if (await CensusErc20Api.isRegistered(tokenInfo.address, pool)) {
        throw new TokenAlreadyRegisteredError(tokenInfo.symbol);
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

      if (error instanceof NoTokenBalanceError || error instanceof TokenAlreadyRegisteredError)
        return setAlertMessage(error.message);

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
      <If condition={!tokenInfo}>
        <Then>
          <WhiteSection>
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
          </WhiteSection>
        </Then>
        <Else>
          <WhiteSection>
            <TokenContainer {...tokenInfo} />
            <ButtonsRow
              registeringToken={registeringToken}
              alreadyRegistered={alreadyRegistered}
              onSubmit={onSubmit}
              address={tokenInfo?.address || ""}
              isConnected={isConnected}
              onRevalidate={() => setTokenInfo(null)}
            />
          </WhiteSection>
        </Else>
      </If>
    </>
  );
};

export default TokenAddPage;
