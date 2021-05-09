import { ProcessInfo, usePool } from "@vocdoni/react-hooks";
import { VotingApi } from "dvote-js";
import { BigNumber } from "ethers";
import useSWR from "swr";
import TokenAmount from "token-amount";
import { TokenInfo } from "../../types";

export const useProcessInfo = (info: ProcessInfo, token: Partial<TokenInfo>) => {
  const { poolPromise } = usePool();

  const updateResults = async (info: ProcessInfo, token: Partial<TokenInfo>) => {
    try {
      const pool = await poolPromise;
      const resultsSanitized = {
        title: info.metadata.title.default,
        description: info.metadata.description.default,
        questions: [],
      };

      try {
        const results = await VotingApi.getResultsDigest(info.id, pool);
        // this is supported for single choice multiquestion voting
        // we will need to add more complex logic to parse results
        // for different type of voting
        if (info.parameters.envelopeType.hasEncryptedVotes) {
          resultsSanitized.questions = info.metadata.questions.map(
            ({ description, title, choices }) => {
              const choicesFormatted = choices.map(({ title: choiceTitle }) => ({
                title: choiceTitle.default,
                percentage: "N/A",
              }));
              return {
                title: title.default,
                description: description.default,
                choices: choicesFormatted,
              };
            }
          );
        } else {
          resultsSanitized.questions = results.questions.map(({ title, voteResults }, i) => {
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

              const vote = new TokenAmount(votes, token.decimals);
              return {
                title: title.default,
                votes: `${vote.toString()} ${token.symbol}`,
                percentage: percentage,
              };
            });
            return {
              title: title.default,
              description: info.metadata.questions[i].description.default,
              choices,
            };
          });
        }
      } catch (e) {
        console.log("ERROR on getting results");
        resultsSanitized.questions = info.metadata.questions.map(
          ({ description, title, choices }) => {
            const choicesFormatted = choices.map(({ title: choiceTitle }) => ({
              title: choiceTitle.default,
              percentage: "0.00",
            }));
            return {
              title: title.default,
              description: description.default,
              choices: choicesFormatted,
            };
          }
        );
      }

      return resultsSanitized;
    } catch (e) {
      console.log("Error in useProcessInfo hook: ", e.message);
      throw new Error(e.message);
    }
  };

  const { data, mutate, error } = useSWR([info, token], updateResults, {
    isPaused: () => !info || !token,
    refreshInterval: 5000,
  });

  return { results: data, updateResults: mutate, resultsError: error };
};
