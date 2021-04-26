import React, { useContext, useEffect } from "react";
import { useWallet } from "use-wallet";
import { Contract, Provider, setMulticallAddress } from "ethers-multicall";
import useSWR from "swr";
import { providers } from "ethers";
import { useMessageAlert } from "../message-alert";
import { useRegisteredTokens } from "./useRegisteredTokens";
import { ERC20JsonAbi, GOERLI_MULTICALL, GOERLI_CHAINID } from "../../constants";
import { useSigner } from "../useSigner";

type TokenBalance = {
  address: string;
  balance: string;
};

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
  const signer = useSigner();

  const fetchUserTokens = async (signer: providers.JsonRpcSigner, registeredTokens) => {
    if (!registeredTokens) {
      return [];
    }
    const chainId = await signer.getChainId();
    if (chainId === GOERLI_CHAINID) {
      setMulticallAddress(chainId, GOERLI_MULTICALL);
    }

    const account = await signer.getAddress();
    const ethcallProvider = new Provider(signer.provider, chainId);
    const contractCalls = registeredTokens.map((address) =>
      new Contract(address, ERC20JsonAbi).balanceOf(account)
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

  const { data, error, mutate } = useSWR([signer, registeredTokens], fetchUserTokens, {
    isPaused: () => !signer,
  });

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
