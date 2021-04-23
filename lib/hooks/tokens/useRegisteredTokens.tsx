import React, { useContext, useEffect, useRef, useState } from "react";
import { usePool } from "@vocdoni/react-hooks";

import { getRegisteredTokenList } from "../../api";
import { useMessageAlert } from "../message-alert";
import useLocalStorage from "../useLocalStorage";
import useSWR from "swr";

export type Token = {
  address: string;
  symbol: string;
  icon: string;
  name: string;
  cap?: string;
  activeProposals?: number;
};

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
const EXISTING_TOKENS = [
  "0xca0ea2002a4177f9eb1822092ee0b4c183d91bba",
  "0x8255e1faf4d977708f622dba724c62ee2c0ab0fc",
  "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b",
];

export function UseRegisteredTokens({ children }) {
  const { poolPromise } = usePool();
  const { setAlertMessage } = useMessageAlert();
  const [cache, updateCache] = useLocalStorage("voting:tokens", EXISTING_TOKENS);

  // @TODO: Move this to a services folder
  const fetchTokens = async (lastKnownTokenCount?: number): Promise<string[]> => {
    const pool = await poolPromise;
    const addresses = await getRegisteredTokenList(lastKnownTokenCount || 0, pool);

    // @TODO: Add multicall + fetch of token information

    if (!addresses) {
      return null;
    }

    return addresses;
  };

  const { data, error, mutate } = useSWR("fetchTokens", fetchTokens);

  useEffect(() => {
    if (error) setAlertMessage(error);
  }, [error]);

  useEffect(() => {
    // @TODO: Add validation before updating local storage
    if (data) {
      updateCache(data);
    }
  }, [data]);

  return (
    <UseRegisteredTokensContext.Provider
      value={{
        registeredTokens: cache,
        refreshRegisteredTokens: mutate,
        error,
      }}
    >
      {children}
    </UseRegisteredTokensContext.Provider>
  );
}
