import { usePool } from "@vocdoni/react-hooks";
import { ProcessDetails, VotingApi } from "@vocdoni/voting";
import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import TokenAmount from "token-amount";
import { strDateDiff } from "../../date";
import { TokenInfo } from "../../types";
import { useProcessDates } from "./useProcessDates";

export const useProcessSummary = ({
  processDetails,
  tokenInfo,
}: {
  processDetails: ProcessDetails;
  tokenInfo: Partial<TokenInfo>;
}) => {
  const { poolPromise } = usePool();
  const { startDate, endDate, hasStarted } = useProcessDates(processDetails?.state);
  const [voteCount, setVoteCount] = useState(0);
  const [resultsWeight, setResultsWeight] = useState(BigNumber.from(0));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => updateProcessSummary(), 1000 * 30);
    updateProcessSummary();

    return () => clearInterval(interval);
  }, [processDetails?.id, hasStarted, poolPromise]);

  // Loader

  const updateProcessSummary = () => {
    if (!processDetails?.id || !hasStarted) return;

    setLoading(true);

    return poolPromise
      .then((pool) =>
        Promise.all([
          VotingApi.getEnvelopeHeight(processDetails?.id, pool),
          VotingApi.getResultsWeight(processDetails?.id, pool),
        ])
      )
      .then(([voteCount, resultsWeight]) => {
        setLoading(false);
        setVoteCount(voteCount);
        setResultsWeight(resultsWeight);
      })
      .catch((err) => {
        setLoading(false);
        setError(err?.message || err.toString());
      });
  };

  let summary: { description: string; value: string }[];

  if (!tokenInfo) {
    summary = [];
  } else if (!hasStarted) {
    summary = [
      { description: "Status", value: startDate ? strDateDiff("start-date", startDate) : "-" },
      { description: `${tokenInfo?.symbol || ""} used`, value: "-" },
      { description: "Turnout", value: "-" },
      { description: "Votes", value: "-" },
    ];
  } else {
    let absoluteAmount = "0";
    let turnout = "0";

    if (!resultsWeight.isZero()) {
      //format result weights
      absoluteAmount = new TokenAmount(resultsWeight, tokenInfo.decimals, {
        symbol: tokenInfo.symbol,
      }).format({ symbol: "" });

      // Display <1 token instead of rounding small numbers down to 0.
      if (absoluteAmount === "0") absoluteAmount = "<1";

      const relativeWeight_bn = BigNumber.from(resultsWeight).mul(100 * 10);
      const relativeWeight = relativeWeight_bn.div(tokenInfo.totalSupply).toNumber() / 10; // 1 decimal
      turnout = `${relativeWeight === 0 ? "<0.1" : relativeWeight}%`;
    }

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
        value: turnout,
      },
      {
        description: "Votes",
        value: voteCount.toString(),
      },
    ];
  }

  return { summary, loading, error, refresh: updateProcessSummary };
};
