import { ProcessInfo, useBlockStatus, usePool } from "@vocdoni/react-hooks";
import { VotingApi } from "dvote-js";
import { BigNumber } from "ethers";
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
}[];

export const useProcessResults = (processInfo: ProcessInfo, tokenInfo: Partial<TokenInfo>) => {
  const { poolPromise } = usePool();
  const { blockStatus } = useBlockStatus();
  const [results, setResults] = useState<ProcessResults>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const processId = processInfo?.id;
  const tokenAddress = tokenInfo?.address;

  useEffect(() => {
    const interval = setInterval(() => fetchCurrentResults(), 1000 * 30);
    fetchCurrentResults();

    return () => clearInterval(interval);
  }, [processId, tokenAddress, !!blockStatus]);

  // Loader

  const fetchCurrentResults = async () => {
    if (!tokenInfo || !processId || !tokenAddress) return;
    else if (!blockStatus) return;

    const hasEncryptedVotes = processInfo.parameters.envelopeType.hasEncryptedVotes;

    // Encrypted and not ended?
    if (hasEncryptedVotes) {
      const endBlock = processInfo.parameters.startBlock + processInfo.parameters.blockCount;
      if (blockStatus.blockNumber < endBlock) {
        // Return empty results

        const results = processInfo.metadata.questions.map(({ title, choices }) => {
          const choicesFormatted = choices.map(({ title: choiceTitle }) => ({
            title: choiceTitle.default,
            votes: "",
            percentage: "N/A",
          }));
          return {
            title: title.default,
            choices: choicesFormatted,
          };
        });
        setResults(results);
        setError("");
        return;
      }
    }

    setLoading(true);
    const pool = await poolPromise;

    try {
      const response = await VotingApi.getResultsDigest(processInfo.id, pool);

      // Note: This is supported for single choice multiquestion voting
      // we will need to add more complex logic to parse results
      // for different type of voting

      const results = response.questions.map(({ title, voteResults }) => {
        const totalVoteAmountBn = voteResults.reduce((prev: BigNumber, { title, votes }) => {
          return prev.add(votes);
        }, BigNumber.from(0));
        const choices = voteResults.map(({ title, votes }) => {
          let percentage = "0";
          if (!votes.isZero()) {
            // Since BigNumber only do rounded division, it is necessary necessary to
            // multiply the votes by 100 before the division. However, this will yield
            // integer percentages. In order to get percentages with 2 decimal places,
            // it is necessary to multiply the votes by an additional 100 before the
            // division
            const factorBn = votes.mul(10000).div(totalVoteAmountBn);
            // factor is now within [0,10'000]

            if (factorBn.isZero()) {
              percentage = "small"; //vote is too small for percentage with 2 decimals
            } else {
              percentage = (factorBn.toNumber() / 100).toFixed(2);
              //percentage is now within [0,100], rounded to 2 decimal places.
            }
          }
          const vote = new TokenAmount(votes, tokenInfo.decimals);
          return {
            title: title.default,
            votes: `${vote.toString()} ${tokenInfo.symbol}`,
            percentage: percentage,
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
        const results: ProcessResults = processInfo.metadata.questions.map(({ title, choices }) => {
          const choicesFormatted = choices.map(({ title: choiceTitle }) => ({
            title: choiceTitle.default,
            votes: hasEncryptedVotes ? "" : "0 " + tokenInfo.symbol,
            percentage: hasEncryptedVotes ? "" : "0.0%",
          }));
          return {
            title: title.default,
            choices: choicesFormatted,
          };
        });
        setResults(results);
        setError("");
        return;
      }

      setError(e?.message);
    }
  };

  return { results, loading, error, refresh: fetchCurrentResults };
};
