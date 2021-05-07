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
import { useRegisteredTokens } from "../../lib/hooks/tokens";
import Button from "../../components/button";
import SectionTitle from "../../components/sectionTitle";
import SearchWidget from "../../components/searchWidget";
import { PrimaryButton, SecondaryButton } from "../../components/button";
import { useIsMobile } from "../../lib/hooks/useWindowSize";
import { ActionTypes, useModal } from "../../components/Modal/context";

export const StyledSpinner = styled(Spinner)`
  color: ${({ theme }) => theme.accent2};
`;

const RowSummary = styled.div`
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
  margin-top: 9px;
  margin-bottom: 0;
  line-height: 27px;
  color: ${({ theme }) => theme.primary.p1};
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
`;

const Description = styled.h4`
  font-size: 18px;
  overflow-wrap: break-word;
  letter-spacing: 0;
  margin: 0;
`;

const Address = styled.h4`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  font-size: 18px;
  letter-spacing: 0;
`;

const ButtonRow = styled.div`
  margin-top: 5em;

  display: flex;
  justify-content: space-around;

  & > * {
    margin-top: -3em;
  }
`;

const WhiteSection = styled.div`
  padding: 80px 230px;
  background: ${({ theme }) => theme.blackAndWhite.w1};
  border-radius: 13px;
  @media ${({ theme }) => theme.screens.tablet} {
    box-sizing: border-box;
    padding: 10px 27px;
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
    <RowSummary>
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
    </RowSummary>
  </>
);

// MAIN COMPONENT
const TokenAddPage = () => {
  const wallet = useWallet();
  const signer = useSigner();

  const isMobile = useIsMobile();
  const { dispatch } = useModal();

  const { poolPromise } = usePool();
  const [formTokenAddress, setFormTokenAddress] = useState<string>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [registeringToken, setRegisteringToken] = useState(false);
  const { setAlertMessage } = useMessageAlert();
  const { refreshRegisteredTokens, registeredTokens, loading } = useRegisteredTokens();
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // Callbacks

  const checkToken = () => {
    if (loadingToken || !formTokenAddress || loading) return;
    else if (!formTokenAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
      return setAlertMessage("The token address is not valid");
    } else if (registeredTokens.includes(formTokenAddress)) {
      setAlreadyRegistered(true);
    } else setAlreadyRegistered(false);

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

      await refreshRegisteredTokens();

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
        subtitle="Enter the detais of an ERC20 token and start submiiting governance processes"
      />

      <br />

      <WhiteSection>
        <SectionTitle
          smallerTitle={true}
          title="Token contract address"
          subtitle="Enter the address of the ERC20 contract that you want to register"
        />
        <SearchWidget
          onKeyDown={(ev) => (ev.key == "Enter" ? checkToken() : null)}
          onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
            setFormTokenAddress(ev.target.value)
          }
          onClick={loadingToken ? undefined : checkToken}
          loading={loading && !registeredTokens?.length}
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
      </WhiteSection>
      <br />
      {tokenInfo && isMobile ? (
        <WhiteSection>
          <TokenContainer {...tokenInfo} />
          <RegisterButton
            registeringToken={registeringToken}
            alreadyRegistered={alreadyRegistered}
            onSubmit={onSubmit}
            address={tokenInfo?.address || ""}
            isConnected={isConnected}
          />
        </WhiteSection>
      ) : null}
    </>
  );
};

export default TokenAddPage;
