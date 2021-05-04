import { ProcessInfo, usePool } from "@vocdoni/react-hooks";
import { VotingApi } from "dvote-js";
import { useMemo } from "react";
import useSWR from "swr";

import { dayjs } from "../../utils";

export const useProcessDate = (info: ProcessInfo) => {
  const { poolPromise } = usePool();

  const fetchDates = async (startBlock: number, blockCount: number) => {
    try {
      const pool = await poolPromise;
      const getStart = VotingApi.estimateDateAtBlock(startBlock, pool);
      const getEnd = VotingApi.estimateDateAtBlock(startBlock + blockCount, pool);

      const [start, end] = await Promise.all([getStart, getEnd]);

      return { start, end };
    } catch (error) {
      console.log(error.message);
      console.log("Error in useProcessInfo hook: ", error.message);
    }
  };

  const { data: datesInfo, error: datesError } = useSWR(
    [info?.parameters?.startBlock, info?.parameters?.blockCount],
    fetchDates,
    {
      isPaused: () => !info?.parameters?.startBlock || !info?.parameters?.blockCount,
      refreshInterval: 5000,
    }
  );

  const hasEnded = useMemo(() => {
    if (datesInfo) return dayjs().isAfter(datesInfo.end);
  }, [datesInfo]);

  const hasStarted = useMemo(() => {
    if (datesInfo) return dayjs().isAfter(datesInfo.start);
  }, [datesInfo]);

  return {
    datesInfo,
    datesError,
    hasEnded,
    hasStarted,
  };
};
