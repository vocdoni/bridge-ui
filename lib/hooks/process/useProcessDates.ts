import { useBlockStatus } from "@vocdoni/react-hooks";
import { IProcessInfo, VotingApi } from "dvote-js";
import { useEffect, useState } from "react";

export const useProcessDates = (processInfo: IProcessInfo) => {
  const { blockStatus, loading, error } = useBlockStatus()
  const [startDate, setStartDate] = useState<Date>(null)
  const [endDate, setEndDate] = useState<Date>(null)

  const blockHeight = blockStatus?.blockNumber || 0
  const startBlock = processInfo?.parameters?.startBlock || 0
  const endBlock = processInfo?.parameters?.endBlock || 0

  // Lazy auto refresh
  useEffect(() => {
    const startDate = VotingApi.estimateDateAtBlockSync(startBlock, blockStatus)
    const endDate = VotingApi.estimateDateAtBlockSync(endBlock, blockStatus)

    setStartDate(startDate)
    setEndDate(endDate)
  }, [blockHeight, startBlock, endBlock])

  const hasStarted = startDate && Date.now() >= startDate.getTime()
  const hasEnded = endDate && Date.now() >= endDate.getTime()

  return {
    startDate,
    endDate,
    hasEnded,
    hasStarted,
    loading,
    error
  };
};
