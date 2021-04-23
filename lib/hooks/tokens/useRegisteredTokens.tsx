import React, { useContext, useEffect, useRef, useState } from "react";
import { usePool } from "@vocdoni/react-hooks";

import { getRegisteredTokenList } from "../../api";
import { useMessageAlert } from "../message-alert";
import useLocalStorage from "../useLocalStorage";
import useSWR from "swr";
import { BigNumber } from "@ethersproject/bignumber";

interface RegisteredTokens {
  registeredTokens: string[];
  refreshRegisteredTokens: any;
  error?: string;
}

const UseRegisteredTokensContext = React.createContext<RegisteredTokens>(null);

/** Returns an arran containing the list of registered ERC20 tokens */
export function useRegisteredTokens() {
  const tokenContext = useContext(UseRegisteredTokensContext);

  if (tokenContext === null) {
    throw new Error(
      "useRegisteredTokens() can only be used inside of <UseRegisteredTokens />, " +
        "please declare it at a higher level."
    );
  }
  return tokenContext;
}

// These are the tokens we want to show at first
// Convert this to an array of tokens
export function UseRegisteredTokens({ children }) {
  const [registeredTokens, updateRegisteredAddresses] = useState<string[]>();
  const { poolPromise } = usePool();
  const { setAlertMessage } = useMessageAlert();

  // @TODO: Move this to a services folder
  const fetchTokens = async (lastKnownTokenCount?: number): Promise<string[]> => {
    const pool = await poolPromise;
    const addresses = await getRegisteredTokenList(lastKnownTokenCount || 0, pool);

    if (!addresses) {
      return undefined;
    }

    return addresses;
  };

  const { data, error, mutate } = useSWR("fetchTokens", fetchTokens);

  useEffect(() => {
    if (error) setAlertMessage(error);
  }, [error]);

  useEffect(() => {
    if (data) updateRegisteredAddresses(data);
  }, [data]);

  return (
    <UseRegisteredTokensContext.Provider
      value={{
        registeredTokens,
        refreshRegisteredTokens: mutate,
        error,
      }}
    >
      {children}
    </UseRegisteredTokensContext.Provider>
  );
}
