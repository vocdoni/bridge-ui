import { utils } from "ethers";
import { FALLBACK_TOKEN_ICON, EMPTY_ADDRESS, TRUST_WALLET_BASE_URL } from "./constants";

export const areAllNumbers = (slice: any[]) => {
  for (let i = 0; i < slice.length; i++) {
    if (typeof slice[i] !== "number") {
      return false;
    }
  }
  return true;
};

export function limitedText(str: string, maxLength = 60): string {
  if (!str || !str.length || str.length < maxLength) return str;

  return str.substr(0, maxLength) + "...";
}
export function throwIfNotBrowser() {
  if (typeof window == "undefined")
    throw new Error("The storage component should only be used on the web browser side");
}

/**
 * @param address - address to modify
 * @param slashIndex - number of letters to show at beginning of address
 * @returns formatted address
 */
export function shortAddress(address: string, slashIndex = 15): string {
  // An ethereum address has 42 characters
  return address.slice(0, slashIndex) + "..." + address.slice(38, 42);
}

export function tokenIconUrl(address = "") {
  if (process.env.ETH_NETWORK_ID == "goerli") return FALLBACK_TOKEN_ICON;

  try {
    address = toChecksumAddress(address.trim());
  } catch (err) {
    return null;
  }

  if (address === EMPTY_ADDRESS) {
    return `${TRUST_WALLET_BASE_URL}/info/logo.png`;
  }

  return `${TRUST_WALLET_BASE_URL}/assets/${address}/logo.png`;
}

function toChecksumAddress(address) {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    throw new Error('Given address "' + address + '" is not a valid Ethereum address.');
  }

  const addressHash = utils.keccak256(address).replace(/^0x/i, "");
  let checksumAddress = "0x";

  for (let i = 0; i < address.length; i++) {
    // If ith character is 9 to f then make it uppercase
    if (parseInt(addressHash[i], 16) > 7) {
      checksumAddress += address[i].toUpperCase();
    } else {
      checksumAddress += address[i];
    }
  }
  return checksumAddress;
}

/**
 * Merge two sorted arrays of objects based on key
 * @param shortArr shorter array
 * @param longArr longer array
 * @param key object key to merge on
 * @returns 
 */
export function mergeOnKey(shortArr: any[], longArr: any[], key: string) {
  let longStart = 0, shortStart = 0;
  const merge = [];

  while (shortStart < shortArr.length) {
    while (shortArr[shortStart][key] != longArr[longStart][key]) longStart += 1;
    merge.push({ ...longArr[longStart], ...shortArr[shortStart] });
    shortStart += 1;
  }
  return merge;
}
