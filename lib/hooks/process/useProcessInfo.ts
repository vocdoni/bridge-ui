import { ProcessInfo, usePool } from "@vocdoni/react-hooks";
import { VotingApi } from "dvote-js";
import useSWR from "swr";
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

      const results = await VotingApi.getResultsDigest(info.id, pool);

      // this is supported for single choice multiquestion voting
      // we will need to add more complex logic to parse results
      // for different type of voting
      resultsSanitized.questions = results.questions.map(({ title, voteResults }, i) => {
        const choices = voteResults.map(({ title, votes }) => {
          // const percentage = votes.mul(100).div(token.totalSupply).toNumber();
          // console.log({ percentage: percentage });
          return {
            title: title.default,
            votes: `${1} ${token.symbol}`,
            percentage: "0",
          };
        });
        return {
          title: title.default,
          description: info.metadata.questions[i].description.default,
          choices,
        };
      });
      return resultsSanitized;
    } catch (e) {
      console.log("Error in useProcessInfo hook: ", e.message);
      throw new Error(e.message);
    }
  };

  const { data, mutate, error } = useSWR([info, token], updateResults, {
    isPaused: () => !info || !token,
    refreshInterval: 20000,
  });

  return { results: data, updateResults: mutate, resultsError: error };
};
