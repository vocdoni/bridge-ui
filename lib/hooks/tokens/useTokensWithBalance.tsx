import React, { useContext, useEffect, useState } from "react";
import { Contract, ContractCall, Provider } from "ethers-multicall";
import { useWallet } from "use-wallet";
import { BigNumber, providers } from "ethers";
import { useMessageAlert } from "../message-alert";
import { useStoredTokens } from "./useStoredTokens";
import { ERC20_ABI } from "../../constants";
import { TokenInfo } from "../../types";

interface UserTokenInfo {
  tokenInfoList: TokenInfo[];
  refresh: any;
  error?: string;
  loading: boolean;
}

const UseTokensWithBalanceContext = React.createContext<UserTokenInfo>({} as any);

/** Returns an array containing the list of registered ERC20 tokens */
export function useTokensWithBalance() {
  const userTokenContext = useContext(UseTokensWithBalanceContext);

  if (userTokenContext === null) {
    throw new Error(
      "useTokensWithBalance() can only be used inside of <UseTokensWithBalance />, " +
      "please declare it at a higher level."
    );
  }
  return userTokenContext;
}

export function UseTokensWithBalance({ children }) {
  const { storedTokens, error: tokenListError, loading: tokenListLoading } = useStoredTokens();
  const { setAlertMessage } = useMessageAlert();
  const wallet = useWallet<providers.JsonRpcFetchFunc>();
  const [tokenInfoList, setTokenInfoList] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserTokens()
  }, [wallet?.account, storedTokens])

  const fetchUserTokens = async (): Promise<TokenInfo[]> => {
    if (!wallet?.ethereum || !wallet?.account || !storedTokens) return;

    try {
      setLoading(true);

      const provider = new providers.Web3Provider(wallet.ethereum);
      const ethcallProvider = new Provider(provider, wallet.chainId);
      const tokenBalanceCalls: ContractCall[] = storedTokens.map((tokenInfo) =>
        new Contract(tokenInfo?.address, ERC20_ABI).balanceOf(wallet.account)
      );

      const balances = await ethcallProvider.all(tokenBalanceCalls);
      const tokensWithBalance = storedTokens
        .filter((_, idx) => !BigNumber.from(balances[idx]).isZero());

      setLoading(false);
      setTokenInfoList(tokensWithBalance);
      setError("");
    }
    catch (err) {
      setLoading(false);
      setError(err?.message);
    }
  };

  useEffect(() => {
    if (error) setAlertMessage(error);
  }, [error]);

  return (
    <UseTokensWithBalanceContext.Provider
      value={{
        tokenInfoList,
        refresh: fetchUserTokens,
        error: error || tokenListError,
        loading: loading || tokenListLoading
      }}
    >
      {children}
    </UseTokensWithBalanceContext.Provider>
  );
}
