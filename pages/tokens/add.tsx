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
import { useIsMobile } from "../../lib/hooks/useWindowSize";

const StyledSpinner = styled(Spinner)`
  color: ${({ theme }) => theme.accent2};
`;

const RowSummary = styled.div`
  margin-top: 2em;
  display: flex;
  justify-content: space-between;
  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const Info = styled.div`
  max-width: 25%;
  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 100%;
    flex-direction: row;
  }
`;

const TokenAttributeTitle = styled.p`
  margin-top: 0;
  margin-bottom: 9;
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

const RegisterButton = styled(Button)`
  height: 46px;
  padding: 12px 20px;
  background: linear-gradient(
    ${({ theme }) => theme.gradients.primary.mg1.a},
    ${({ theme }) => theme.gradients.primary.mg1.c1},
    ${({ theme }) => theme.gradients.primary.mg1.c2}
  );
  box-shadow: ${({ theme }) => theme.shadows.buttonShadow};
  border-radius: 8px;
  color: ${({ theme }) => theme.blackAndWhite.w1};
  font-size: 16px;
`;

// MAIN COMPONENT
const TokenAddPage = () => {
  const wallet = useWallet();
  const signer = useSigner();

  const isMobile = useIsMobile();
  const { poolPromise } = usePool();
  const [formTokenAddress, setFormTokenAddress] = useState<string>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [registeringToken, setRegisteringToken] = useState(false);
  const { setAlertMessage } = useMessageAlert();
  const { refreshRegisteredTokens } = useRegisteredTokens();

  // Callbacks

  const checkToken = () => {
    if (loadingToken || !formTokenAddress) return;
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

  const onSubmit = useCallback(async () => {
    if (!tokenInfo) return;
    if (!wallet.connector || !wallet.account) {
      try {
        //@TODO: When wallet modal PR is merged, open that modal here
        await wallet.connect("injected");
      } catch (e) {
        return setAlertMessage("Web3 support is not available");
      }
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
      await registerToken(tokenInfo.address, holderAddress, pool, signer);

      await refreshRegisteredTokens();

      setAlertMessage("The token has been successfully registered");
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
          onChange={(ev) => setFormTokenAddress(ev.target.value)}
          onClick={loadingToken ? undefined : checkToken}
        />

        <br />
        <br />

        {tokenInfo && !isMobile && (
          <>
            <SectionTitle
              smallerTitle={true}
              title="Token contract details"
              subtitle="The following token will be registered. All token holders will be able to submit new governance processes."
            />
            <RowSummary>
              <Info>
                <TokenAttributeTitle>Token symbol</TokenAttributeTitle>
                <Description>{tokenInfo?.symbol}</Description>
              </Info>
              <Info>
                <TokenAttributeTitle>Token name</TokenAttributeTitle>
                <Description>{tokenInfo?.name}</Description>
              </Info>
              <Info>
                <TokenAttributeTitle>Total supply</TokenAttributeTitle>
                <Description>{tokenInfo?.totalSupplyFormatted}</Description>
              </Info>
              <Info>
                <TokenAttributeTitle>Token address</TokenAttributeTitle>
                <Address>{tokenInfo?.address}</Address>
              </Info>
            </RowSummary>

            <ButtonRow>
              {registeringToken ? (
                <Button>
                  <StyledSpinner />
                </Button>
              ) : (
                <RegisterButton onClick={onSubmit}>Register token</RegisterButton>
              )}
            </ButtonRow>
          </>
        )}
      </WhiteSection>
      <br />
      {tokenInfo && isMobile ? (
        <WhiteSection>
          <>
            <SectionTitle
              smallerTitle={true}
              title="Token contract details"
              subtitle="The following token will be registered. All token holders will be able to submit new governance processes."
            />
            <RowSummary>
              <Info>
                <TokenAttributeTitle>Token symbol</TokenAttributeTitle>
                <Description>{tokenInfo?.symbol}</Description>
              </Info>
              <Info>
                <TokenAttributeTitle>Token name</TokenAttributeTitle>
                <Description>{tokenInfo?.name}</Description>
              </Info>
              <Info>
                <TokenAttributeTitle>Total supply</TokenAttributeTitle>
                <Description>{tokenInfo?.totalSupplyFormatted}</Description>
              </Info>
              <Info>
                <TokenAttributeTitle>Token address</TokenAttributeTitle>
                <Address>{tokenInfo?.address}</Address>
              </Info>
            </RowSummary>
          </>
        </WhiteSection>
      ) : null}
    </>
  );
};

export default TokenAddPage;
