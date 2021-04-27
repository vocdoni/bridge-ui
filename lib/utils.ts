import { ProcessMetadata } from "dvote-js";
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
export function shortAddress(address: string, slashIndex = 6): string {
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

/* find the question with the most choices */
export function findMaxValue(metadata: ProcessMetadata) {
  let longest = 0
  metadata.questions.forEach(question => {
    longest = Math.max(longest, question.choices.length)
  });
  return longest
}
