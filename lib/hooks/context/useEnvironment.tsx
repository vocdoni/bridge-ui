import { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "use-wallet";

import { getNetworkVars, NetworkVariables } from "../../constants/env";
import { OutsideProviderError } from "../../errors";

const UseEnvironmentContext = createContext<NetworkVariables>(null);

export function useEnvironment() {
  const environmentContext = useContext(UseEnvironmentContext);

  if (environmentContext === null) {
    throw new OutsideProviderError("useEnvironment()", "<UseEnvironmentProvider />");
  }

  return environmentContext;
}

export function UseEnvironmentProvider({ children }) {
  const { chainId } = useWallet();
  const [environment, setEnvironment] = useState<NetworkVariables>(getNetworkVars());

  useEffect(() => {
    const newEnvironment = getNetworkVars(chainId);
    setEnvironment(newEnvironment);
  }, [chainId]);

  return (
    <UseEnvironmentContext.Provider value={environment}>{children}</UseEnvironmentContext.Provider>
  );
}
