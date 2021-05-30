import { Wallet } from "use-wallet";

enum MethodType {
  PAGE,
  IDENTIFY,
  EVENT,
}

function getAnalyticsMethod(methodType: MethodType) {
  const windowAnalytics = (window as any).analytics;
  if (!windowAnalytics) {
    console.warn("Analytics could not be laoded.");
    return null;
  }
  if (methodType === MethodType.PAGE) return windowAnalytics.page;
  if (methodType === MethodType.IDENTIFY) return windowAnalytics.identify;
  if (methodType === MethodType.EVENT) return windowAnalytics.track;
}

type WalletInfo = {
  wallet_address: string;
  wallet_provider: string;
  network: string;
};

/**
 * This method keeps track of certain events (like creation of proposals, etc.).
 *
 * @param eventName name of the event to be tracked
 * @param wallet wallet information (as provided by useWallet())
 * @param data additional data relating to tracked event
 * @returns void
 */
export function trackEvent<T>(eventName: string, wallet: Wallet, data: T) {
  if (wallet.status !== "connected") {
    console.warn("Analytics information missing");
    return;
  }
  const walletData: WalletInfo = {
    wallet_address: wallet.account,
    wallet_provider: wallet.connector,
    network: wallet.networkName,
  };
  const eventData: WalletInfo & T = {
    ...walletData,
    ...data,
  };

  const trackerMethod = getAnalyticsMethod(MethodType.EVENT);
  if (typeof trackerMethod !== "function") {
    console.warn("analytics function not defined");
    return;
  }
  trackerMethod(eventName, eventData);
}

/**
 * Sends analytics informations about the pages visited.
 *
 * @param pathName (Dynamic) Path name as given by the nextjs router.
 * @returns void
 */
export function trackPage(pathName: string) {
  const trackerMethod = getAnalyticsMethod(MethodType.PAGE);
  if (typeof trackerMethod !== "function") {
    console.warn("analytics function not defined");
    return;
  }

  trackerMethod({
    path: pathName,
  });
}

/**
 * Sends analytics informations about the connected wallets.
 *
 * @param account Wallet address
 * @param networkName Name of the ethereum network the wallet is connected to
 * @param connector Wallet connector used by use-wallet library
 * @returns void
 */
export function trackId(account: string, networkName: string, connector: string) {
  const trackerMethod = getAnalyticsMethod(MethodType.IDENTIFY);
  if (typeof trackerMethod !== "function") {
    console.warn("analytics function not defined");
    return;
  }

  const walletData: WalletInfo = {
    wallet_address: account,
    wallet_provider: connector,
    network: networkName,
  };

  trackerMethod(walletData);
}
