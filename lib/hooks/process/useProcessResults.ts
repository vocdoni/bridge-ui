import { ProcessInfo, usePool } from "@vocdoni/react-hooks";
import { VotingApi } from "dvote-js";
import { useEffect, useState } from "react";
import TokenAmount from "token-amount";
import { TokenInfo } from "../../types";

export type ProcessResults = {
  title: string;
  choices: {
    title: string;
    votes: string;
    percentage: string;
  }[];
}[]

export const useProcessResults = (processInfo: ProcessInfo, tokenInfo: Partial<TokenInfo>) => {
  const { poolPromise } = usePool();
  const [results, setResults] = useState<ProcessResults>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const processId = processInfo?.id
  const tokenAddress = tokenInfo?.address

  useEffect(() => {
    const interval = setInterval(() => fetchCurrentResults(), 1000 * 30)
    fetchCurrentResults()

    return () => clearInterval(interval)
  }, [processId, tokenAddress])

  // Loader

  const fetchCurrentResults = async () => {
    if (!tokenInfo || !processId || !tokenAddress) return;

    setLoading(true);
    const pool = await poolPromise;

    try {
      const response = await VotingApi.getResultsDigest(processInfo.id, pool);

      // Note: This is supported for single choice multiquestion voting
      // we will need to add more complex logic to parse results
      // for different type of voting

      const results = response.questions.map(({ title, voteResults }) => {
        const choices = voteResults.map(({ title, votes }) => {
          const percentage = votes.mul(100 * 10).div(tokenInfo.totalSupply).toNumber();
          const vote = new TokenAmount(votes, tokenInfo.decimals);
          return {
            title: title.default,
            votes: `${vote.toString()} ${tokenInfo.symbol}`,
            percentage: Number(percentage / 10).toFixed(1),
          };
        });
        return {
          title: title.default,
          choices,
        };
      });
      setLoading(false);
      setResults(results);
      setError("");
    } catch (e) {
      setLoading(false);

      if (e?.message == "The results are not available") {
        const results: ProcessResults = processInfo.metadata.questions.map(
          ({ title, choices }) => {
            const choicesFormatted = choices.map(({ title: choiceTitle }) => ({
              title: choiceTitle.default,
              votes: "0 " + tokenInfo.symbol,
              percentage: "N/A",
            }));
            return {
              title: title.default,
              choices: choicesFormatted,
            };
          }
        );
        setResults(results);
        setError("");
        return;
      }

      setError(e?.message);
    }
  };

  return { results, loading, error, refresh: fetchCurrentResults };
};
