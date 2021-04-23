import React, { useContext, useEffect, useState } from "react";
import { useMessageAlert } from "../message-alert";
import { useWallet } from "use-wallet";
import { Contract, Provider, setMulticallAddress } from "ethers-multicall";
import { providers } from "ethers";
import { useRegisteredTokens } from "./useRegisteredTokens";
import { ERC20JsonAbi, GOERLI_MULTICALL, GOERLI_CHAINID } from "../../constants";
import useSWR from "swr";

type TokenBalance = {
  address: string;
  balance: string;
};

interface TokenBalances {
  userTokens: TokenBalance[];
  refreshUserTokens: any;
  error?: string;
}

const UseUserTokensContext = React.createContext<TokenBalances>(null)

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
    return ethcallProvider
      .all(contractCalls)
      .then((balances) => {
        return registeredTokens.flatMap((address, index) =>
          balances[index] == 0 ? [] : [{ address, balance: balances[index].toString() }]
        );
      })
      .catch((err) => {
        setAlertMessage("Could not fetch the list of user tokens");
        return [];
      });
  };

  const { data, error, mutate } = useSWR("fetchUserTokens", fetchUserTokens);

  useEffect(() => {
    if (error) setAlertMessage(error);
  }, [error]);

  return (
    <UseUserTokensContext.Provider 
      value={{ 
        userTokens: data,
        refreshUserTokens: mutate,
        error,
      }}
    >
      {children}
    </UseUserTokensContext.Provider>
  );
}
