import { useBlockStatus } from "@vocdoni/react-hooks";
import { ProcessState, VotingApi } from "@vocdoni/voting";
import { useEffect, useState } from "react";

export const useProcessDates = (processState: ProcessState) => {
  const { blockStatus, loading, error } = useBlockStatus();
  const [startDate, setStartDate] = useState<Date>(null);
  const [endDate, setEndDate] = useState<Date>(null);

  const blockHeight = blockStatus?.blockNumber || 0;
  const startBlock = processState?.startBlock || 0;
  const endBlock = processState?.endBlock || 0;

  // Lazy auto refresh
  useEffect(() => {
    let startDate: Date;
    let endDate: Date;

    if (processState?.archived) {
      if (!processState?.startDate || !processState?.endDate) return;
      startDate = processState.startDate;
      endDate = processState.endDate;
    } else {
      if (!blockHeight) return;
      startDate = VotingApi.estimateDateAtBlockSync(startBlock, blockStatus);
      endDate = VotingApi.estimateDateAtBlockSync(endBlock, blockStatus);
    }

    setStartDate(startDate);
    setEndDate(endDate);
  }, [blockHeight, startBlock, endBlock]);

  const hasStarted = startDate && Date.now() >= startDate.getTime();
  const hasEnded = endDate && Date.now() >= endDate.getTime();

  return {
    startDate,
    endDate,
    hasEnded,
    hasStarted,
    loading,
    error,
  };
};
