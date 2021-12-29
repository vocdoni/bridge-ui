import { EthNetworkID } from "dvote-js";
import { TokenAddress, TokenInfo } from "./types";

const featuredTokens = {
  mainnet: [
    { address: "0xa117000000f279d81a1d3cc75430faa017fa5a2e", idx: 6 }, // ANT
    { address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", idx: 3 }, // UNI
    { address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", idx: 4 }, // AAVE
    { address: "0x2aec18c5500f21359ce1bea5dc1777344df4c0dc", idx: null }, // FTT
    { address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", idx: 5 }, // MATIC
    { address: "0xc00e94cb662c3520282e6f5717214004a7f26888", idx: 2 }, // COMP
    { address: "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f", idx: null }, // SNX
    { address: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2", idx: null }, // SUSHI
    { address: "0x0d8775f648430679a709e98d2b0cb6250d2887ef", idx: null }, // BAT
    { address: "0x35a9b440da4410dd63df8c54672b728970560328", idx: null }, // MANA
    { address: "0x6b175474e89094c44da98b954eedeac495271d0f", idx: 0 }, // DAI
    { address: "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828", idx: null }, // UMA
    { address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", idx: null }, // MKR
  ],
  rinkeby: [
    { address: "0x7d8abd67a201b289bd64b438c701b39f4c2ef476", idx: 79 }, // PPT
    { address: "0xc778417e063141139fce010982780140aa0cd5ab", idx: 26 }, // WETH uniswap
    { address: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea", idx: 3 }, // DAI
    { address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", idx: 25 }, // UNI
    { address: "0xf0f8d83cdab2f9514bef0319f1b434267be36b5c", idx: 2 }, // ANTv2
  ],
  goerli: [
    { address: "0x2b7222146a805bba0dbb61869c4b3a03209dffba", idx: null }, // VOCB
    { address: "0xf7a702d8f197e6d510eaf740998c2029744078b5", idx: null }, // AVT
  ],
  xdai: [],
  sokol: [],
};

/**
 * This method returns the list of featured tokens for a given network. These tokens are
 * displayed on Voice's main page.
 *
 * @param networkName
 * @returns curated list of featured tokens addresses
 */
export function getFeaturedTokens(networkName: EthNetworkID): TokenAddress[] {
  return featuredTokens[networkName].map((token) => token.address);
}

/**
 * This method returns the list of featured tokens by it's index for a given network. These tokens are
 * displayed on Voice's main page.
 *
 * @param networkName
 * @returns curated list of featured tokens addresses and index
 */
export function getFeaturedTokensByIndex(networkName: EthNetworkID): TokenAddress[] {
  return featuredTokens[networkName].filter((token) => token.idx !== null).map((token) => token.idx);
}

/**
 * This method compares two token infos in order to determine their lexical order. The
 * comparison is done w.r.t. the *symbol* field of the TokenInfo passed. Furthermore, the
 * comparison is case *insensitive*.
 *
 * @param a token info holding a string to compare
 * @param b token info holding a string to compare
 * @returns -1 | 0 | 1
 */
export function tokenSorter(a: TokenInfo, b: TokenInfo) {
  const lowerCaseA = a?.symbol.toLocaleLowerCase();
  const lowerCaseB = b?.symbol.toLocaleLowerCase();

  if (lowerCaseA > lowerCaseB) return 1;
  else if (lowerCaseA < lowerCaseB) return -1;
  return 0;
}
