import { ProcessInfo, usePool } from "@vocdoni/react-hooks";
import { VotingApi } from "dvote-js";
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
        resultsSanitized.questions = results.questions.map(({ title, voteResults }, i) => {
          const choices = voteResults.map(({ title, votes }) => {
            const percentage = new TokenAmount(
              votes.div(token.totalSupply),
              token.decimals
            ).toString();

            const vote = new TokenAmount(votes, token.decimals);

            return {
              title: title.default,
              votes: `${vote.toString()} ${token.symbol}`,
              percentage: (Number(percentage) * 100).toFixed(2),
            };
          });
          return {
            title: title.default,
            description: info.metadata.questions[i].description.default,
            choices,
          };
        });
      } catch (e) {
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
