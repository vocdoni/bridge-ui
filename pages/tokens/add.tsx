import React, { useCallback, useState } from "react";
import { CensusErc20Api } from "dvote-js";
import Router from "next/router";
import styled from "styled-components";
import { useWallet } from "use-wallet";
import Spinner from "react-svg-spinner";
import { usePool } from "@vocdoni/react-hooks";

import Button from "../../components/button";
import { getTokenInfo, hasBalance, registerToken } from "../../lib/api";
import { NO_TOKEN_BALANCE, TOKEN_ALREADY_REGISTERED } from "../../lib/errors";
import { TokenInfo } from "../../lib/types";
import { useMessageAlert } from "../../lib/hooks/message-alert";
import { useRegisteredTokens } from "../../lib/hooks/tokens";
import { TopSection } from "../../components/top-section";
import { useSigner } from "../../lib/hooks/useSigner";

const StyledSpinner = styled(Spinner)`
  color: ${({ theme }) => theme.accent2};
`;

const LeftSection = styled.div`
  flex: 7;
  input[type="text"] {
    border: none;
    background-color: ${({ theme }) => theme.blackAndWhite.w1};
    padding: 1em;
    margin-top: 1em;
    border-radius: 8px;
    width: calc(100% - 2 * 1em);
  }

  @media ${({ theme }) => theme.screens.tablet} {
    max-width: 100%;
  }
`;
const RightSection = styled.div`
  display: flex;
  align-items: flex-end;
  flex: 3;
  margin-left: 2em;
  & > * {
    width: 100%;
  }

  @media ${({ theme }) => theme.screens.tablet} {
    margin-top: 20px;
    max-width: 100%;
    margin-left: 0px;
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;

  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
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
  @media ${({ theme }) => theme.screens.tablet} {
    flex-direction: row;
  }
`;

const Title = styled.p`
  font-weight: 500;
`;

const Description = styled.h4`
  font-size: 18px;
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

const RowContinue = styled.div`
  margin-top: 5em;

  display: flex;
  justify-content: space-around;

  & > * {
    margin-top: -3em;
    min-width: 250px;
  }
`;

const TokenContractDetails = styled.div`
  text-align: center;
`;

const LightText = styled.p`
  color: ${({ theme }) => theme.blackAndWhite.w1};
  letter-spacing: 0.01em;
`;

// MAIN COMPONENT
const TokenAddPage = () => {
  const wallet = useWallet();
  const signer = useSigner();
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
    <div>
      <TopSection
        title="Register a Token"
        description="Enter the details of an ERC20
                             token and start submitting
                             governance processes."
      />
      <Row>
        <LeftSection>
          <h2>Token contract address</h2>
          <LightText>Enter the address of the ERC20 contract that you want to register</LightText>
          <input
            type="text"
            placeholder="0x1234..."
            onKeyDown={(ev) => (ev.key == "Enter" ? checkToken() : null)}
            onChange={(ev) => setFormTokenAddress(ev.target.value)}
          />
        </LeftSection>
        <RightSection>
          <Button   onClick={loadingToken ? undefined : checkToken}>
            {loadingToken ? <StyledSpinner /> : "Check token"}
          </Button>
        </RightSection>
      </Row>

      {tokenInfo && (
        <>
          <TokenContractDetails>
            <h2>Token contract details</h2>
            <LightText>
              The following token will be registered. All token holders will be able to submit new
              governance processes.
            </LightText>
          </TokenContractDetails>

          <RowSummary>
            <Info>
              <Title>Token symbol</Title>
              <Description>{tokenInfo?.symbol}</Description>
            </Info>
            <Info>
              <Title>Token name</Title>
              <Description>{tokenInfo?.name}</Description>
            </Info>
            <Info>
              <Title>Total supply</Title>
              <Description>{tokenInfo?.totalSupplyFormatted}</Description>
            </Info>
            <Info>
              <Title>Token address</Title>
              <Address>{tokenInfo?.address}</Address>
            </Info>
          </RowSummary>

          <RowContinue>
            {registeringToken ? (
              <Button>
                <StyledSpinner />
              </Button>
            ) : (
              <Button onClick={onSubmit}>
                Register token
              </Button>
            )}
          </RowContinue>
        </>
      )}
    </div>
  );
};

export default TokenAddPage;
