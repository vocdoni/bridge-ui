import { usePool } from "@vocdoni/react-hooks";
import { VotingApi } from "dvote-js";
import { BigNumber } from "ethers";
import useSWR from "swr";
import TokenAmount from "token-amount";
import { TokenInfo } from "../../types";
import { retrieveStatus } from "../../utils";

export const useWeights = ({ processId, token, start, end }) => {
  const { poolPromise } = usePool();

  //@TODO: Improve return statements (Apply some DRY)
  const updateWeight = async (processId: string, token: TokenInfo, start: Date, end: Date) => {
    try {
      const statusValue = retrieveStatus(start, end);
      const hasNotStarted = statusValue.includes("Starts");
      if (hasNotStarted) {
        return [
          {
            description: "Status",
            value: statusValue,
          },
          {
            description: `${token.symbol} Used`,
            value: "-",
          },
          {
            description: "Turnout",
            value: "-",
          },
          {
            description: "Votes",
            value: "-",
          },
        ];
      }

      const pool = await poolPromise;
      const votes = await VotingApi.getEnvelopeHeight(processId, pool);
      const resultsWeight = await VotingApi.getResultsWeight(processId, pool);
      const absolute = new TokenAmount(resultsWeight, token.decimals, {
        symbol: token.symbol,
      });

      const absoluteAmount = absolute.format({
        symbol: "",
      });

      const weight = BigNumber.from(resultsWeight).mul(100 * 10);
      const relative = weight.div(token.totalSupply).toNumber() / 10; // 1 decimal
      const votesEmitted = votes.toString();

      return [
        {
          description: "Status",
          value: statusValue,
        },
        {
          description: `${token.symbol} Used`,
          value: absoluteAmount,
        },
        {
          description: "Turnout",
          value: `${relative}%`,
        },
        {
          description: "Votes",
          value: votesEmitted,
        },
      ];
    } catch (e) {
      console.log("Error in useWeights hook: ", e.message);
      throw new Error(e.message);
    }
  };

  const { data, mutate, error } = useSWR([processId, token, start, end], updateWeight, {
    isPaused: () => !processId || !token,
    refreshInterval: 20000,
  });

  return { weights: data, updateWeights: mutate, weightsError: error };
};
