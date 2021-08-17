// NOTE This code is copied from @vocdoni/react-hooks.
// Due to dependency issues between bridge-ui, dvotejs, and react-hooks, it was simpler to
// copy the code and make a change (adding poolPromise as useEffect dependency to
// provider) then creating a PR for it. [VR 17-08-2021]

// TODO RETURN THIS MODIFIED CODE TO react-hooks LIBRAR!!

import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { BlockStatus, VotingApi } from "dvote-js";
import { usePool } from "@vocdoni/react-hooks";

const VOCHAIN_BLOCK_TIME = 12;
export type Nullable<T> = T | null;

// Context
export type BlockStatusContext = {
  blockStatus: BlockStatus;
  loading: boolean;
  error: string;
};
const DEFAULT_VALUE: BlockStatusContext = {
  blockStatus: { blockNumber: -1, blockTimes: [], blockTimestamp: -1 },
  loading: false,
  error: "",
};
export const UseBlockStatusContext = createContext<BlockStatusContext>(DEFAULT_VALUE);

// Frontend

export function useDateAtBlock(vochainBlock: number) {
  const poolContext = useContext(UseBlockStatusContext);
  if (poolContext === null) {
    throw new Error(
      "useDateAtBlock() can only be used on the descendants of <UseBlockStatusProvider />, " +
        "please declare it at a higher level."
    );
  }
  const { blockStatus, loading, error } = poolContext;

  if (!blockStatus || blockStatus.blockNumber < 0) {
    return { date: null, loading, error };
  }

  const date = VotingApi.estimateDateAtBlockSync(vochainBlock, blockStatus);

  return { date, loading, error };
}

export function useBlockAtDate(date: Date) {
  const poolContext = useContext(UseBlockStatusContext);
  if (poolContext === null) {
    throw new Error(
      "useBlockAtDate() can only be used on the descendants of <UseBlockStatusProvider />, " +
        "please declare it at a higher level."
    );
  }
  const { blockStatus, loading, error } = poolContext;

  if (!blockStatus || blockStatus.blockNumber < 0) {
    return { blockHeight: null, loading, error };
  }

  const blockHeight = VotingApi.estimateBlockAtDateTimeSync(date, blockStatus);

  return { blockHeight, loading, error };
}

export function useBlockStatus() {
  const poolContext = useContext(UseBlockStatusContext);
  if (poolContext === null) {
    throw new Error(
      "useDateAtBlock() can only be used on the descendants of <UseBlockStatusProvider />, " +
        "please declare it at a higher level."
    );
  }
  return poolContext;
}

export function useBlockHeight() {
  const poolContext = useContext(UseBlockStatusContext);
  if (poolContext === null) {
    throw new Error(
      "useDateAtBlock() can only be used on the descendants of <UseBlockStatusProvider />, " +
        "please declare it at a higher level."
    );
  }
  const { blockStatus, loading, error } = poolContext;
  if (!blockStatus || blockStatus.blockNumber < 0) {
    return { blockHeight: null, loading, error };
  }

  return { blockHeight: blockStatus.blockNumber, error, loading };
}

// Backend

export function UseBlockStatusProvider({ children }: { children: ReactNode }) {
  const { poolPromise } = usePool();
  const [blockStatus, setBlockStatus] = useState<Nullable<BlockStatus>>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Nullable<string>>(null);
  let disposed = false;

  // Auto update
  useEffect(() => {
    const interval = setInterval(() => fetchBlockStatus(), 1000 * VOCHAIN_BLOCK_TIME);
    fetchBlockStatus();

    return () => {
      disposed = true;
      clearInterval(interval);
    };
  }, [poolPromise]);

  // Loader
  const fetchBlockStatus = () => {
    if (typeof window == "undefined") return;

    setLoading(true);

    poolPromise
      .then((pool) => VotingApi.getBlockStatus(pool))
      .then((blockStatus) => {
        if (disposed) return;

        setLoading(false);
        setError("");
        setBlockStatus(blockStatus);
      })
      .catch((err) => {
        if (disposed) return;

        setLoading(false);
        setError(err?.message || err?.toString?.());
      });
  };

  return (
    <UseBlockStatusContext.Provider value={{ blockStatus, loading, error }}>
      {children}
    </UseBlockStatusContext.Provider>
  );
}
