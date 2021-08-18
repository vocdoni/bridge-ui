import React, { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "use-wallet";

import { getNetworkVars, NetworkVariables } from "../constants/env";
import { OutsideProviderError } from "../errors";

const UseEnvironmentContext = createContext<NetworkVariables>(null);

export function useEnvironment() {
  const environmentContext = useContext(UseEnvironmentContext);

  if (environmentContext === null) {
    throw new OutsideProviderError("useEnvironment()", "<UseEnvironmentProvider />");
  }

  return environmentContext;
}

export function UseEnvironmentProvider({ children }) {
  const { chainId, status } = useWallet();

  const env = getNetworkVars(1);
  const [variables, setVariables] = useState<NetworkVariables>(env);

  useEffect(() => {
    if (status === "connected") {
      setVariables(getNetworkVars(chainId));
    } else {
      setVariables(getNetworkVars(1));
    }
  }, [chainId, status]);

  return (
    <UseEnvironmentContext.Provider value={variables}>{children}</UseEnvironmentContext.Provider>
  );
}
