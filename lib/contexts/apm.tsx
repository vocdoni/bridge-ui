import React, { useMemo, useContext, useState } from "react";
import { ApmBase, init as initApm, Transaction } from "@elastic/apm-rum";
import { afterFrame } from "@elastic/apm-rum-core";
import { BUILD } from "../constants/env";

const UseAPMContext = React.createContext(null);

export function ApmProvider({ children }) {
  const [apm, setApm] = useState<ApmBase>(() =>
    initApm({
      serviceName: "Voice",
      serverUrl: "https://apm-monitoring.aragon.org",
      serviceVersion: BUILD.commitSha,
      environment: BUILD.environment,
    })
  );

  const contextValue = useMemo(() => {
    return { apm, setApm };
  }, [apm, setApm]);

  return <UseAPMContext.Provider value={contextValue}>{children}</UseAPMContext.Provider>;
}

export function useApm() {
  return useContext(UseAPMContext);
}

export function updateApmContext(apm: ApmBase, networkType: string) {
  if (apm && networkType) {
    const context = { networkType: networkType };
    apm.addLabels(context);
    apm.setCustomContext(context);
  }
}

export function instrumentApmRoutes(apm: ApmBase, url: string) {
  if (apm) {
    const tx: Transaction = apm.startTransaction(url, "route-change", {
      managed: false,
      canReuse: false,
    });

    afterFrame(() => {
      tx && tx.end();
    });
  }
}
