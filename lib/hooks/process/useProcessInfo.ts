import { ProcessInfo, usePool } from "@vocdoni/react-hooks";
import { VotingApi } from "dvote-js";
import useSWR from "swr";

export const useProcessInfo = (info: ProcessInfo) => {
  const { poolPromise } = usePool();

  const updateResults = async (info: ProcessInfo) => {
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
      results.questions.forEach(({ title, voteResults }, i) => {
        const choices = voteResults.map(({ title, votes }) => ({
          title: title.default,
          votes: votes.toNumber(),
        }));

        resultsSanitized.questions.push({
          title: title.default,
          description: info.metadata.questions[i].description.default,
          choices,
        });
      });

      return resultsSanitized;
    } catch (e) {
      console.log("Error in useProcessInfo hook: ", e.message);
      throw new Error(e.message);
    }
  };

  const { data, mutate, error } = useSWR([info], updateResults, {
    isPaused: () => !info,
    refreshInterval: 20000,
  });

  return { results: data, updateResults: mutate, resultsError: error };
};
