import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "use-wallet";

import { useMessageAlert } from "../contexts/message-alert";
import { getNetworkVars, NetworkVariables } from "../constants/env";
import { OutsideProviderError } from "../errors";

type EnvironmentInformation = {
  variables: NetworkVariables;
  unsupportedNetwork: boolean;
};

const UseEnvironmentContext = createContext<EnvironmentInformation>(null);

export function useEnvironment() {
  const environmentContext = useContext(UseEnvironmentContext);

  if (environmentContext === null) {
    throw new OutsideProviderError("useEnvironment()", "<UseEnvironmentProvider />");
  }

  return environmentContext;
}

export function UseEnvironmentProvider({ children }) {
  const { chainId } = useWallet();
  const { setAlertMessage } = useMessageAlert();

  const env = getNetworkVars(1);
  const [variables, setVariables] = useState<NetworkVariables>(env);
  const [isNetworkSupported, setIsNetworkSupported] = useState<boolean>(true);

  useEffect(() => {
    let newEnvironment: NetworkVariables;
    if (!chainId) {
      // This case covers unconnected wallets
      newEnvironment = getNetworkVars(1);
      setIsNetworkSupported(true);
    } else {
      newEnvironment = getNetworkVars(chainId);
      if (newEnvironment.chainId !== chainId) {
        setIsNetworkSupported(false);
        setAlertMessage("The currently selected network is not supported", "warning");
      } else {
        setIsNetworkSupported(true);
      }
    }

    setVariables(newEnvironment);
  }, [chainId]);

  return (
    <UseEnvironmentContext.Provider
      value={{ variables: variables, unsupportedNetwork: isNetworkSupported }}
    >
      {children}
    </UseEnvironmentContext.Provider>
  );
}
