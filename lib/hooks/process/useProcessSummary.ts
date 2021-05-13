import { usePool } from "@vocdoni/react-hooks";
import { IProcessInfo, VotingApi } from "dvote-js";
import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import TokenAmount from "token-amount";
import { strDateDiff } from "../../date";
import { TokenInfo } from "../../types";
import { useProcessDates } from "./useProcessDates";

export const useProcessSummary = ({ processInfo, tokenInfo }:
  { processInfo: IProcessInfo, tokenInfo: Partial<TokenInfo> }) => {
  const { poolPromise } = usePool();
  const { startDate, endDate, hasStarted } = useProcessDates(processInfo);
  const [voteCount, setVoteCount] = useState(0)
  const [resultsWeight, setResultsWeight] = useState(BigNumber.from(0))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const interval = setInterval(() => updateProcessSummary(), 1000 * 30)
    updateProcessSummary()

    return () => clearInterval(interval)
  }, [processInfo?.id, hasStarted])

  // Loader

  const updateProcessSummary = () => {
    if (!(processInfo?.id) || !hasStarted) return

    setLoading(true)

    return poolPromise
      .then(pool => Promise.all([
        VotingApi.getEnvelopeHeight(processInfo?.id, pool),
        VotingApi.getResultsWeight(processInfo?.id, pool),
      ]))
      .then(([voteCount, resultsWeight]) => {
        setLoading(false)

        setVoteCount(voteCount)
        setResultsWeight(resultsWeight)
      })
      .catch(err => {
        setLoading(false)
        setError(err?.message || err.toString())
      })

  }

  let summary: { description: string, value: string }[]

  if (!tokenInfo) {
    summary = [];
  }
  else if (!hasStarted) {
    summary = [
      { description: "Status", value: startDate ? strDateDiff("start-date", startDate) : "-", },
      { description: `${tokenInfo?.symbol || ""} used`, value: "-", },
      { description: "Turnout", value: "-", },
      { description: "Votes", value: "-", },
    ];
  }
  else {
    const absolute = new TokenAmount(resultsWeight, tokenInfo.decimals, { symbol: tokenInfo.symbol });
    const absoluteAmount = absolute.format({ symbol: "" });

    const weight = BigNumber.from(resultsWeight).mul(100 * 10);
    const relative = weight.div(tokenInfo.totalSupply).toNumber() / 10; // 1 decimal

    summary = [
      {
        description: "Status",
        value: hasStarted ? strDateDiff("end-date", endDate) : strDateDiff("start-date", startDate),
      },
      {
        description: `${tokenInfo.symbol} Used`,
        value: absoluteAmount,
      },
      {
        description: "Turnout",
        value: `${relative}%`,
      },
      {
        description: "Votes",
        value: voteCount.toString(),
      },
    ];
  }

  return { summary, loading, error, refresh: updateProcessSummary };
};
