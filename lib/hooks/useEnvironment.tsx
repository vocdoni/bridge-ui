import { DEFAULT_CHAIN_ID, getNetworkVars } from "../constants/env";
import { useDebounce } from "./useDebounce";
import { useSigner } from "./useSigner";

export function useEnvironment() {
  const signerValue = useSigner();
  const { chainId } = useDebounce(signerValue);

  if (typeof chainId !== "number") {
    return getNetworkVars(DEFAULT_CHAIN_ID);
  }

  return getNetworkVars(chainId);
}
