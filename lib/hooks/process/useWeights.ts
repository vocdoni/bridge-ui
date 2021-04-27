import { usePool } from "@vocdoni/react-hooks";
import { VotingApi } from "dvote-js";
import { BigNumber } from "ethers";
import useSWR from "swr";
import TokenAmount from "token-amount";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const useWeights = ({ processId, token, start, end }) => {
  const { poolPromise } = usePool();

  const retrieveStatus = (start, end) => {
    const now = dayjs();
    const hasFinished = now.isAfter(end);
    if (hasFinished) {
      return `Ended ${dayjs(end).fromNow()}`;
    }

    const hasStarted = now.isAfter(start);
    if (hasStarted) {
      return `Ends ${now.to(end)}`;
    }

    return `Starts ${now.to(start)}`;
  };

  //@TODO: Improve return statements (Apply some DRY)
  const updateWeight = async (processId, token, start, end) => {
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
        commify: false,
      });

      const weight = Number(absoluteAmount) * 100;
      const relative = BigNumber.from(weight).div(token.totalSupply);
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
          value: `${relative.toString()}%`,
        },
        {
          description: "Votes",
          value: votesEmitted,
        },
      ];
    } catch (e) {
      console.log("Error: ", e.message);
    }
  };

  const { data } = useSWR([processId, token, start, end], updateWeight, {
    isPaused: () => !processId || !token,
    refreshInterval: 20000,
  });

  return data;
};
