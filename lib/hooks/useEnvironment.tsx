import { useWallet } from "use-wallet";
import { DEFAULT_CHAIN_ID, getNetworkVars } from "../constants/env";
import { useDebounce } from "./useDebounce";

export function useEnvironment() {
  const wallet = useWallet();
  const { chainId } = useDebounce(wallet);

  if (typeof chainId == "number") {
    return getNetworkVars(chainId);
  }
  return getNetworkVars(DEFAULT_CHAIN_ID);
}
