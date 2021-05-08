import { ProcessMetadata } from "dvote-js";
import { utils } from "ethers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FALLBACK_TOKEN_ICON, EMPTY_ADDRESS, TRUST_WALLET_BASE_URL } from "./constants";

dayjs.extend(relativeTime);

export { dayjs };

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

export const retrieveStatus = (start: Date, end: Date): string => {
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
