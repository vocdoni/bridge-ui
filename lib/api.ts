import { BigNumber, Contract, ethers, providers, Signer } from "ethers";
import { CensusErc20Api, GatewayPool, ITokenStorageProofContract, VotingApi } from "dvote-js";
import TokenAmount from "token-amount";
import Bluebird from "bluebird";
import { NO_TOKEN_BALANCE } from "./errors";
import { ProcessInfo, TokenInfo } from "./types";
import { ERC20_ABI, ERC20_ABI_MAKER } from "./constants";
import { Awaited, tokenIconUrl } from "./utils";

export interface ProofParameters {
  account: string;
  token: string;
  pool: GatewayPool;
  block: number;
  balanceMappingPosition: number;
}

export async function getTokenProcesses(
  tokenAddr: string,
  pool: GatewayPool
): Promise<ProcessInfo[]> {
  try {
    const list = await getProcessList(tokenAddr, pool);
    const allProcess = list.map((processId) => getProcessInfo(processId, pool));
    const allProcessesInformation = await Promise.allSettled(allProcess);
    const sanitizeProccesses = (p) => {
      if (p.status === "fulfilled") return p.value;
    };
    return allProcessesInformation.map(sanitizeProccesses);
  } catch (err) {
    if (err?.message?.includes("Key not found")) return [];
    throw err;
  }
}

export async function getProcessInfo(processId: string, pool: GatewayPool): Promise<ProcessInfo> {
  const results = await Promise.all([
    VotingApi.getProcessMetadata(processId, pool),
    VotingApi.getProcessParameters(processId, pool),
  ]);

  return {
    metadata: results[0],
    parameters: results[1],
    id: processId, // pass-through to have the value for links
    tokenAddress: results[1].entityAddress.toLowerCase(),
  };
}

export async function getProcessList(tokenAddress: string, pool: GatewayPool): Promise<string[]> {
  let result: string[] = [];
  let from = 0;

  while (true) {
    const processList = await VotingApi.getProcessList({ entityId: tokenAddress, from }, pool);
    if (processList.length == 0) return result;

    result = result.concat(processList.map((id) => "0x" + id));
    from += processList.length;
  }
}

export type CensusProof = Awaited<ReturnType<typeof CensusErc20Api.generateProof>>["proof"]
export const getProof = async ({
  account,
  token,
  pool,
  block,
  balanceMappingPosition,
}: ProofParameters): Promise<CensusProof> => {
  try {
    const balance = await balanceOf(token, account, pool);
    if (balance.isZero()) throw new Error(NO_TOKEN_BALANCE);

    const balanceSlot = CensusErc20Api.getHolderBalanceSlot(account, balanceMappingPosition);
    const result = await CensusErc20Api.generateProof(
      token,
      [balanceSlot],
      block,
      pool.provider as providers.JsonRpcProvider
    );

    if (result == null || !result.proof) return undefined;

    const onChainBalance = BigNumber.from(result.proof.storageProof[0].value);
    if (onChainBalance.isZero()) throw new Error(NO_TOKEN_BALANCE);

    if (!onChainBalance.eq(balance) || onChainBalance.eq(0)) return undefined;

    return result.proof;
  } catch (error) {
    throw new Error(error.message);
  }
};

export async function registerToken(token: string, pool: GatewayPool, signer: Signer) {
  try {
    await CensusErc20Api.registerTokenAuto(token, signer, pool);
  } catch (err) {
    if (err && err.message == NO_TOKEN_BALANCE) throw err;
    throw new Error("The token internal details cannot be checked");
  }
}

const parseMKRInfo = ([name, symbol, ...token]) => {
  return [ethers.utils.parseBytes32String(name), ethers.utils.parseBytes32String(symbol), ...token];
};

// Map of ERC20 contracts that doesn't support the standard ABI
const AbiMap = {
  // MKR - Name and symbol are bytes32 instead of string
  "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2": {
    abi: ERC20_ABI_MAKER,
    handler: parseMKRInfo,
  },
};

export function getTokenInfo(address: string, pool: GatewayPool): Promise<TokenInfo> {
  if (!address) return;

  // TODO: erc20Helpers is untyped
  const erc20Helpers = AbiMap[address] ?? { abi: ERC20_ABI };
  const tokenInstance = new Contract(address, erc20Helpers.abi, pool.provider);

  return Promise.all([
    tokenInstance.name(),
    tokenInstance.symbol(),
    tokenInstance.totalSupply(),
    tokenInstance.decimals(),
    CensusErc20Api.getTokenInfo(address, pool),
    getProcessList(address, pool),
  ]).then((token: [string, string, BigNumber, number, Awaited<ReturnType<typeof CensusErc20Api.getTokenInfo>>, string[]]) => {
    if (erc20Helpers.handler) {
      token = erc20Helpers.handler(token);
    }
    const [name, symbol, supply, decimals, balMappingPos, pids] = token;

    const totalSupply = new TokenAmount(supply.toString(), decimals, {
      symbol,
    });

    return {
      name,
      symbol,
      totalSupply: supply,
      totalSupplyFormatted: totalSupply.format(),
      decimals,
      address,
      balanceMappingPosition: balMappingPos.balanceMappingPosition,
      icon: tokenIconUrl(address),
      processes: pids,
    } as TokenInfo;
  });
}

export function balanceOf(
  tokenAddress: string,
  holderAddress: string,
  pool: GatewayPool
): Promise<BigNumber> {
  const tokenInstance = new Contract(tokenAddress, ERC20_ABI, pool.provider);
  return tokenInstance.balanceOf(holderAddress);
}

export function hasBalance(
  tokenAddress: string,
  holderAddress: string,
  pool: GatewayPool
): Promise<boolean> {
  const tokenInstance = new Contract(tokenAddress, ERC20_ABI, pool.provider);
  return tokenInstance.balanceOf(holderAddress).then((balance) => !balance.isZero());
}

/** Retrieves the list of registered ERC20 token addresses on the smart contract. 
 * IMPORTANT: If no new tokens are registered, `null` is returned. */
export function getRegisteredTokenList(
  currentTokenCount: number,
  pool: GatewayPool
): Promise<string[]> {
  return CensusErc20Api.getTokenCount(pool)
    .then((count) => {
      // Nothing changed?
      if (count == currentTokenCount) return Promise.resolve([]);

      return Bluebird.map(
        Array.from(Array(count).keys()),
        (idx) => CensusErc20Api.getTokenAddressAt(idx, pool).then((addr) => addr.toLowerCase()),
        { concurrency: 50 }
      );
    });
}

/** Waits for a while and returns true when the given process is already available for the given entity. 
 * Returns false after 30 failed attempts.
 */
export async function waitUntilProcessCreated(processId: string, tokenAddress: string, pool: GatewayPool): Promise<boolean> {
  let retries = 30;
  let processList = await VotingApi.getProcessList({ entityId: tokenAddress }, pool);

  const trimProcId = processId.replace(/^0x/, "");
  let start = processList.length;

  while (retries >= 0) {
    while (!processList.some(v => v == trimProcId)) {
      processList = await VotingApi.getProcessList({ entityId: tokenAddress, from: start }, pool);
      if (!processList.length) break;

      start += processList.length;
    }
    if (processList.length && processList.some(v => v == trimProcId)) {
      return true;
    }
    await new Promise(r => setTimeout(r, 4000)) // Wait 4s;
    retries--;
  }
  return false;
}
