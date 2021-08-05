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
  const env = getNetworkVars(1, "env provider init");
  const [environment, setEnvironment] = useState<NetworkVariables>(env);

  useEffect(() => {
    console.log("// ==== PROVIDER EFFECT START ====");

    let newEnvironment;
    if (!chainId) {
      console.log("UseWallet has no chainId");
      newEnvironment = getNetworkVars(1, "env provider effect");
    } else {
      console.log("UseWallet has chainId: " + chainId);
      newEnvironment = getNetworkVars(chainId, "env provider effect");
    }
    setEnvironment(newEnvironment);
    console.log("\\\\ ==== PROVIDER EFFECT END ====");
  }, [chainId]);

  console.log("RETURNING FROM PROVIDER: " + JSON.stringify(environment, null, 2));
  return (
    <UseEnvironmentContext.Provider value={environment}>{children}</UseEnvironmentContext.Provider>
  );
}
