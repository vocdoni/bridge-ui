import { ProcessInfo, usePool } from "@vocdoni/react-hooks";
import { VotingApi } from "dvote-js";
import useSWR from "swr";

import dayjs from "dayjs";

export const useProcessInfo = (info: ProcessInfo, start: Date) => {
  const { poolPromise } = usePool();

  const updateResults = async (info) => {
    try {
      const resultsSanitized = {
        title: info.metadata.title.default,
        description: info.metadata.description.default,
        questions: [],
      };

      const pool = await poolPromise;

      const results = await VotingApi.getResultsDigest(info.id, pool);

      // this is supported for single choice multiquestion voting
      results.questions.forEach(({ title, voteResults }) => {
        const choices = voteResults.map(({ title, votes }) => ({
          title: title.default,
          votes: votes.toNumber(),
        }));

        resultsSanitized.questions.push({
          title: title.default,
          choices,
        });
      });

      return resultsSanitized;
    } catch (e) {
      console.log("Error in useProcessInfo hook: ", e.message);
      throw new Error(e.message);
    }
  };

  const now = dayjs();
  const hasResults = dayjs(now).isAfter(start);
  const { data, mutate, error } = useSWR([info, hasResults], updateResults, {
    isPaused: () => !info || !hasResults,
    refreshInterval: 20000,
  });

  return { results: data, updateResults: mutate, resultsError: error };
};
