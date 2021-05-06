import { BigNumber, Contract, providers, Signer } from "ethers";
import { CensusErc20Api, GatewayPool, ITokenStorageProofContract, VotingApi } from "dvote-js";
import TokenAmount from "token-amount";
import Bluebird from "bluebird";
import { NO_TOKEN_BALANCE } from "./errors";
import { ProcessInfo, TokenInfo } from "./types";
import { ERC20_ABI } from "./constants";
import { tokenIconUrl } from "./utils";

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

export const getProof = async ({
  account,
  token,
  pool,
  block,
  balanceMappingPosition,
}: ProofParameters) => {
  try {
    const balance = await balanceOf(token, account, pool);
    const balanceSlot = CensusErc20Api.getHolderBalanceSlot(account, balanceMappingPosition);
    const result = await CensusErc20Api.generateProof(
      token,
      [balanceSlot],
      block,
      pool.provider as providers.JsonRpcProvider
    );

    if (result == null || !result.proof) return undefined;

    const onChainBalance = BigNumber.from(result.proof.storageProof[0].value);

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

export function getTokenInfo(address: string, pool: GatewayPool): Promise<TokenInfo> {
  const tokenInstance = new Contract(address, ERC20_ABI, pool.provider);

  return Promise.all([
    tokenInstance.name(),
    tokenInstance.symbol(),
    tokenInstance.totalSupply(),
    tokenInstance.decimals(),
    CensusErc20Api.getTokenInfo(address, pool).catch(() => BigNumber.from(-1)),
    getProcessList(address, pool),
  ]).then(
    ([name, symbol, supply, decimals, balMappingPos, pids]: [
      string,
      string,
      BigNumber,
      number,
      any,
      string[]
    ]) => {
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
      };
    }
  );
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

/** Retrieves the list of registered ERC20 token addresses on the smart contract. IMPORTANT: If no new tokens are registered, `null` is returned. */
export function getRegisteredTokenList(
  currentTokenCount: number,
  pool: GatewayPool
): Promise<string[]> {
  let contractInstance: ITokenStorageProofContract;
  return pool
    .getTokenStorageProofInstance()
    .then((instance) => {
      contractInstance = instance;

      return contractInstance.tokenCount();
    })
    .then((count) => {
      if (count == currentTokenCount) return Promise.resolve(null);

      return Bluebird.map(
        Array.from(Array(count).keys()),
        (idx) => {
          return contractInstance.tokenAddresses(idx).then((addr) => addr.toLowerCase());
        },
        { concurrency: 100 }
      );
    });
}

/** Counts how many ERC20 tokens are registered on the smart contract. */
export function getRegisteredTokenCount(pool: GatewayPool): Promise<number> {
  let contractInstance: ITokenStorageProofContract;
  return pool.getTokenStorageProofInstance().then((instance) => {
    contractInstance = instance;

    return contractInstance.tokenCount();
  });
}
