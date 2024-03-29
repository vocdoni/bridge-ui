import { useBlockStatus, usePool, useProcess } from "@vocdoni/react-hooks";
import { ProcessDetails, Voting, VotingApi } from "dvote-js";
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

export const useProcessResults = (
  processDetails: ProcessDetails,
  tokenInfo: Partial<TokenInfo>
) => {
  const { poolPromise } = usePool();
  const { blockStatus } = useBlockStatus();
  const [results, setResults] = useState<ProcessResults>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const processId = processDetails?.id;
  const tokenAddress = tokenInfo?.address;
  const { process } = useProcess(processId)

  useEffect(() => {
    const interval = setInterval(() => fetchCurrentResults(), 1000 * 30);
    fetchCurrentResults();

    return () => clearInterval(interval);
  }, [processId, tokenAddress, !!blockStatus]);

  // Loader

  const fetchCurrentResults = async () => {
    if (!tokenInfo || !processId || !tokenAddress) return;
    else if (!blockStatus) return;

    const hasEncryptedVotes = processDetails?.state?.envelopeType?.encryptedVotes;

    // Encrypted and not ended?
    if (hasEncryptedVotes) {
      const endBlock = processDetails?.state?.endBlock;
      if (blockStatus.blockNumber < endBlock) {
        // Return empty results

        const results =
          processDetails?.metadata?.questions?.map?.(({ title, choices }) => {
            const choicesFormatted = choices.map(({ title: choiceTitle }) => ({
              title: choiceTitle.default,
              votes: "",
              percentage: "N/A",
            }));
            return {
              title: title.default,
              choices: choicesFormatted,
            };
          }) || [];
        setLoading(false);
        setResults(results);
        setError("");
        return;
      }
    }

    setLoading(true);
    const pool = await poolPromise;

    try {
      const rawResults = await VotingApi.getResults(processDetails?.id, pool);
      const { questions } = Voting.digestSingleChoiceResults(rawResults, process.metadata);

      // Note: This is supported for single choice multiquestion voting
      // we will need to add more complex logic to parse results
      // for different type of voting

      const results = questions.map(({ title, voteResults }) => {
        const totalVoteAmountBn = voteResults.reduce((prev: BigNumber, { title, votes }) => {
          return prev.add(votes);
        }, BigNumber.from(0));
        const choices = voteResults.map(({ title, votes }) => {
          let percentage = "0";
          if (!votes.isZero()) {
            // NOTES:
            // a) Since BigNumber only does rounded division, it is necessary to multiply the
            // votes by 100 *before* the division. Otherwise, roundDown(1/2)*100=0*100=0%,
            // instead of roundDown(100*1/2)=roundDown(50)=50%.
            // b) However, this will always yield integer percentages. In order to get
            // percentages with 1 decimal place, it is necessary to multiply the votes by
            // an additional 100 before the division. This will carry enough information
            // to display *1* decimal places.
            const factorBn = votes.mul(100 * 100).div(totalVoteAmountBn);
            // factor is now within [0,10'000]

            if (factorBn.isZero()) {
              // If the result of that division is 0, it means the percentage is smaller
              // than 0.1%.
              percentage = "small"; //vote is too small for percentage with 1 decimal
            } else {
              percentage = (factorBn.toNumber() / 100).toFixed(1);
              //percentage is now within [0,100], rounded to 1 decimal place.
            }
          }
          let vote = new TokenAmount(votes, tokenInfo.decimals).toString();
          if (!votes.isZero() && vote === "0") vote = "<0.01";
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
        const results: ProcessResults = processDetails?.metadata?.questions?.map?.(
          ({ title, choices }) => {
            const choicesFormatted =
              choices.map(({ title: choiceTitle }) => ({
                title: choiceTitle.default,
                votes: hasEncryptedVotes ? "" : "0 " + tokenInfo.symbol,
                percentage: "Error",
              })) || [];
            return {
              title: title.default,
              choices: choicesFormatted,
            };
          }
        );
        setResults(results);
        setError("The results are not available");
        return;
      }

      setError(e?.message);
    }
  };

  return { results, loading, error, refresh: fetchCurrentResults };
};
