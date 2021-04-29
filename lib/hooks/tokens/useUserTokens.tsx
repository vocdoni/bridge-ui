import React, { useCallback, useContext, useEffect } from "react";
import { Contract, Provider, setMulticallAddress } from "ethers-multicall";
import { useWallet } from "use-wallet";
import useSWR from "swr";
import { providers } from "ethers";
import { useMessageAlert } from "../message-alert";
import { useRegisteredTokens } from "./useRegisteredTokens";
import { ERC20JsonAbi, GOERLI_MULTICALL, GOERLI_CHAINID } from "../../constants";
import { TokenInfo } from "../../types";

import { usePool } from "@vocdoni/react-hooks";

import { getTokenInfo } from "../../api";

interface TokenBalance extends Partial<TokenInfo> {
  balance: string;
}

interface TokenBalances {
  userTokens: TokenBalance[];
  refreshUserTokens: any;
  error?: string;
}

const UseUserTokensContext = React.createContext<TokenBalances>(null);

/** Returns an array containing the list of registered ERC20 tokens */
export function useUserTokens() {
  const userTokenContext = useContext(UseUserTokensContext);

  if (userTokenContext === null) {
    throw new Error(
      "useUserTokens() can only be used inside of <UseUserTokens />, " +
        "please declare it at a higher level."
    );
  }
  return userTokenContext;
}

export function UseUserTokens({ children }) {
  const { registeredTokens } = useRegisteredTokens();
  const { setAlertMessage } = useMessageAlert();
  const wallet = useWallet<providers.JsonRpcFetchFunc>();
  const { poolPromise } = usePool();

  const refreshTokenInfo: (address: string) => Promise<TokenInfo> = useCallback(
    async (address: string) => {
      const pool = await poolPromise;
      const token = await getTokenInfo(address, pool);
      return token;
    },
    [poolPromise]
  );

  const fetchUserTokens = async (): Promise<TokenBalance[]> => {
    if (!wallet?.ethereum || !wallet?.account || !registeredTokens) {
      return [];
    }
    if (wallet.chainId === GOERLI_CHAINID) {
      setMulticallAddress(wallet.chainId, GOERLI_MULTICALL);
    }

    const provider = new providers.Web3Provider(wallet.ethereum);
    const ethcallProvider = new Provider(provider, wallet.chainId);
    const contractCalls = registeredTokens.map((address) =>
      new Contract(address, ERC20JsonAbi).balanceOf(wallet.account)
    );

    const balances = await ethcallProvider.all(contractCalls);
    const mappedBalances = registeredTokens.flatMap((address, index) =>
      balances[index] == 0 ? [] : [{ address, balance: balances[index].toString() }]
    );

    const fetchPromises = mappedBalances.map((a) => refreshTokenInfo(a.address));
    const allTokensInfo = await Promise.all(fetchPromises);

    return mappedBalances.map((bal, idx) => {
      return {
        ...bal,
        ...allTokensInfo[idx],
      };
    });
  };

  const { data, error, mutate } = useSWR([wallet, registeredTokens], fetchUserTokens, {
    isPaused: () => !wallet.account,
  });

  useEffect(() => {
    if (error) setAlertMessage(error);
  }, [error, setAlertMessage]);

  return (
    <UseUserTokensContext.Provider
      value={{
        userTokens: data as any,
        refreshUserTokens: mutate,
        error,
      }}
    >
      {children}
    </UseUserTokensContext.Provider>
  );
}
