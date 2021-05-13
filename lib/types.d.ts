import { BigNumber } from "@ethersproject/bignumber";
import { ProcessContractParameters, ProcessMetadata, VotingApi } from "dvote-js";
import { Awaited } from "./utils";

export type TokenInfo = {
  name: string;
  symbol: string;
  address: string;
  totalSupply: BigNumber;
  totalSupplyFormatted: string;
  decimals: number;
  balanceMappingPosition: number;
  icon: string;
  processes: string[];
};
export type TokenEntry = Omit<TokenInfo, "processes">;

export type MsgType = "error" | "success" | "warning" | "info";
