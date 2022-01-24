import { BigNumber } from "@ethersproject/bignumber";
// import { ProcessMetadata } from "@vocdoni/data-models";
// import { VotingApi } from "@vocdoni/voting";
// import { ProcessContractParameters } from "@vocdoni/contract-wrappers";
// import { Awaited } from "./utils";

export type TokenAddress = string;

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

export type HookData<T> = {
  data: T;
  isLoading: boolean;
  error: Error;
};
