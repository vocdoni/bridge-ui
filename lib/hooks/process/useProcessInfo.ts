import { usePool } from "@vocdoni/react-hooks";
import { VotingApi } from "dvote-js";
import useSWR from "swr";

export const useProcessInfo = ({ processId }) => {
  const { poolPromise } = usePool();
  const updateResults = async (processId) => {
    if (!processId) return;

    try {
      const pool = await poolPromise;
      const results = await VotingApi.getResultsDigest(processId, pool);
      return results;
    } catch (e) {
      console.error(e);
    }
  };

  const { data } = useSWR(processId, updateResults, {
    isPaused: () => !processId,
  });

  console.log(data);
  return data;
};
