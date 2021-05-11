import React, { useCallback, useState } from "react";
import { CensusErc20Api } from "dvote-js";
import Router from "next/router";
import styled from "styled-components";
import { useWallet } from "use-wallet";
import Spinner from "react-svg-spinner";
import { usePool } from "@vocdoni/react-hooks";
import { getTokenInfo, hasBalance, registerToken } from "../../lib/api";
import { NO_TOKEN_BALANCE, TOKEN_ALREADY_REGISTERED } from "../../lib/errors";
import { TokenInfo } from "../../lib/types";
import { useMessageAlert } from "../../lib/hooks/message-alert";
import { useSigner } from "../../lib/hooks/useSigner";
import { useStoredTokens } from "../../lib/hooks/tokens";
import Button from "../../components/button";
import SectionTitle from "../../components/sectionTitle";
import SearchWidget from "../../components/searchWidget";
import { PrimaryButton, SecondaryButton } from "../../components/button";
import { useIsMobile } from "../../lib/hooks/useWindowSize";
import { ActionTypes, useModal } from "../../components/Modal/context";
import { useScrollTop } from "../../lib/hooks/useScrollTop";

export const StyledSpinner = styled(Spinner)`
  color: ${({ theme }) => theme.accent2};
`;

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
        <StyledSpinner />
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
      subtitle="The following token will be registered. All token holders will be able to submit new governance processes."
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
        <Description>{totalSupplyFormatted}</Description>
      </Info>
      <Info>
        <TokenAttributeTitle>Token address</TokenAttributeTitle>
        <Address>{address}</Address>
      </Info>
    </TokenSummary>
  </>
);

// MAIN COMPONENT
const TokenAddPage = () => {
  useScrollTop();
  const wallet = useWallet();
  const signer = useSigner();

  const isMobile = useIsMobile();
  const { dispatch } = useModal();

  const { poolPromise } = usePool();
  const [formTokenAddress, setFormTokenAddress] = useState<string>("");
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [registeringToken, setRegisteringToken] = useState(false);
  const { setAlertMessage } = useMessageAlert();
  const { storedTokens, refresh: refreshStoredTokens, loading } = useStoredTokens();

  const alreadyRegistered = storedTokens.some(
    (t) => t?.address.toLowerCase() == formTokenAddress.toLowerCase()
  );

  // Callbacks

  const checkToken = () => {
    if (loadingToken || !formTokenAddress || loading) return;
    else if (!formTokenAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
      return setAlertMessage("The token address is not valid");
    }

    setLoadingToken(true);

    poolPromise
      .then((pool) => getTokenInfo(formTokenAddress, pool))
      .then((tokenInfo) => {
        setLoadingToken(false);
        setTokenInfo(tokenInfo);
      })
      .catch((err) => {
        setLoadingToken(false);
        setAlertMessage("Could not fetch the contract details");
      });
  };

  const isConnected = wallet.connector || wallet.account;

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

      setAlertMessage("The token has been successfully registered", "success");
      setRegisteringToken(false);

      Router.push("/tokens/info#/" + tokenInfo.address);
    } catch (err) {
      console.log(err.message);
      setRegisteringToken(false);

      if (err && err.message == NO_TOKEN_BALANCE) return setAlertMessage(NO_TOKEN_BALANCE);
      else if (err && err.message == TOKEN_ALREADY_REGISTERED)
        return setAlertMessage(TOKEN_ALREADY_REGISTERED);

      setAlertMessage("The token could not be registered");
    }
  }, [signer, wallet, tokenInfo]);

  // RENDER

  return (
    <>
      <SectionTitle
        title="Register a new token"
        subtitle="Enter the details of any ERC-20 token and start submitting new governance proposals"
      />

      <br />

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
            onClick={loadingToken ? undefined : checkToken}
            loading={loading && !storedTokens?.length}
          />

          <br />
          <br />

          {!isMobile && tokenInfo ? (
            <>
              <TokenContainer {...tokenInfo} />
              <RegisterButton
                registeringToken={registeringToken}
                alreadyRegistered={alreadyRegistered}
                onSubmit={onSubmit}
                address={tokenInfo?.address || ""}
                isConnected={isConnected}
              />
            </>
          ) : null}
        </Content>
      </WhiteSection>
      <br />
      {tokenInfo && isMobile ? (
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
      ) : null}
    </>
  );
};

export default TokenAddPage;
