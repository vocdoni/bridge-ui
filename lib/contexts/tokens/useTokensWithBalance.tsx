import React, { useContext, useEffect, useState } from "react";
import { Contract, ContractCall, Provider } from "ethers-multicall";
import { useSigner } from "../../hooks/useSigner";
import { BigNumber } from "ethers";
import { usePool } from "@vocdoni/react-hooks";

import { useMessageAlert } from "../message-alert";
import { useStoredTokens } from "./useStoredTokens";
import { ERC20_ABI } from "../../constants/abi";
import { TokenInfo, HookData } from "../../types";
import { OutsideProviderError } from "../../errors";
import { useEnvironment } from "../../hooks/useEnvironment";

/* TODO Investigate whether this should really be implementented as a context, or if a
simple custom hook is more appropriate. [VR 05-08-2021] */

/* TODO Add status indicator (something like below). Extend type structure of UseData to
accomodate for satus indicators across all custom hooks. [VR 05-08-2021] */

type HookStatus = "not connected" | "no tokens" | "ready";

type UserHeldTokens = HookData<TokenInfo[]> & {
  refresh: () => Promise<TokenInfo[]>;
};

const UseTokensWithBalanceContext = React.createContext<UserHeldTokens>({} as any);

/** Returns an array containing the list of registered ERC20 tokens */
export function useTokensWithBalance(sorted = false): UserHeldTokens {
  const userTokenContext = useContext(UseTokensWithBalanceContext);

  if (userTokenContext === null) {
    throw new OutsideProviderError("useTokensWithBalance()", "<UseTokensWithBalance />");
  }
  return userTokenContext;
}

export function UseTokensWithBalance({ children }) {
  const { status, address: holderAddress } = useSigner();
  const { poolPromise } = usePool();
  const { setAlertMessage } = useMessageAlert();
  const { chainId } = useEnvironment();
  const {
    data: storedTokens,
    error: storedTokenError,
    isLoading: storedTokenLoading,
  } = useStoredTokens();

  const [tokenInfoList, setTokenInfoList] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>(null);

  useEffect(() => {
    fetchUserTokens();
  }, [holderAddress, storedTokens, poolPromise, storedTokenLoading]);

  const fetchUserTokens = async (): Promise<TokenInfo[]> => {
    if (
      status !== "connected" ||
      !storedTokens ||
      storedTokenLoading ||
      storedTokens.chainId !== chainId
    )
      return;
    setLoading(true);

    try {
      const pool = await poolPromise;
      const ethcallProvider = new Provider(pool.provider, chainId);
      const tokenBalanceCalls: ContractCall[] = storedTokens.tokens.map((tokenInfo) =>
        new Contract(tokenInfo?.address, ERC20_ABI).balanceOf(holderAddress)
      );

      /* TODO @brickpop extract this to something like hasBalance() in lib/api.ts? [VR 05-08-2021] */
      const balances = await ethcallProvider.all(tokenBalanceCalls);
      const tokensWithBalance = storedTokens.tokens.filter(
        (_, idx) => !BigNumber.from(balances[idx]).isZero()
      );

      setTokenInfoList(tokensWithBalance);
      setError(null);
    } catch (err) {
      setError(new Error(err?.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) setAlertMessage(error.message);
  }, [error]);

  return (
    <UseTokensWithBalanceContext.Provider
      value={{
        data: tokenInfoList,
        isLoading: loading || storedTokenLoading,
        error: error || storedTokenError,
        refresh: fetchUserTokens,
      }}
    >
      {children}
    </UseTokensWithBalanceContext.Provider>
  );
}
