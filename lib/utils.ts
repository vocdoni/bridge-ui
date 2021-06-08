import { ProcessMetadata } from "dvote-js";
import { utils } from "ethers";
import { FALLBACK_TOKEN_ICON, EMPTY_ADDRESS, TRUST_WALLET_BASE_URL } from "./constants";
import { TOKEN_AMOUNT_REGEX } from "./regex";

export type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

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

/**
 * @param tokenName - Token name to modify
 * @param slashIndex - number of letters of the token name to show
 * @returns formatted token name
 */
export function shortTokenName(tokenName: string, slashIndex = 22): string {
  if (tokenName.length > 25) {
    return tokenName.slice(0, slashIndex) + "...";
  } else {
    return tokenName;
  }
}

export function tokenIconUrl(address = "") {
  if (process.env.ETH_NETWORK_ID == "goerli") return FALLBACK_TOKEN_ICON;
  try {
    address = utils.getAddress(address);
  } catch (err) {
    return null;
  }

  if (address === EMPTY_ADDRESS) {
    return `${TRUST_WALLET_BASE_URL}/info/logo.png`;
  }
  return `${TRUST_WALLET_BASE_URL}/assets/${address}/logo.png`;
}

/**
 * Helper-method converts a string of tokens into a abbreviated version.
 *
 * @param amount [string] token amount. May include token symbol.
 * @returns [string] abbreviated token amount. Any decimal digits get discarded. For
 * thousands, millions and billions letters are used. E.g. 10'123'456.78 SYM becomes 10M.
 * Everything greater gets expressed as power of tens.
 */
export function abbreviatedTokenAmount(amount: string): string {
  if (!amount) return "N/A";

  const regexp = TOKEN_AMOUNT_REGEX;
  const regexp_res = amount.match(regexp);
  // discard failed matches
  if (!regexp_res?.length || regexp_res[0].length !== amount.length || regexp_res.length !== 4)
    return "N/A";

  const lead = regexp_res[1];
  const body = regexp_res[2];
  const symbol = regexp_res[3];

  // < 1000
  if (body?.length === 0) return lead + " " + symbol;
  const magnitude = body.length / 4;
  const magnitude_letter = ["K", "M", "B"];

  let abbreviation: string;
  if (magnitude <= 3) {
    // < trillion. Use respective letter.
    abbreviation = magnitude_letter[magnitude - 1];
  } else {
    // > trillion. Use power of tens notation.
    abbreviation = "*10^" + magnitude * 3;
  }

  return lead + abbreviation + " " + symbol;
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
  let longest = 0;
  metadata.questions.forEach((question) => {
    longest = Math.max(longest, question.choices.length);
  });
  return longest;
}

// @TODO: This is WIP - Will finish later / Cesar on 29 of april
export async function waitUntilTrue(time: number, condition: boolean) {
  await new Promise((resolve) => setTimeout(resolve, time));
}
