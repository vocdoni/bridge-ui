import React, { useMemo, useContext, useState } from "react";
import { ApmBase, init as initApm } from "@elastic/apm-rum";
import { afterFrame } from "@elastic/apm-rum-core";
import { BUILD } from "../constants/env";

const UseAPMContext = React.createContext(null);

function ApmProvider({ children }) {
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

function useApm() {
  return useContext(UseAPMContext);
}

function updateApmContext(apm: ApmBase, networkType: string) {
  if (apm && networkType) {
    const context = { networkType: networkType };
    apm.addLabels(context);
    apm.setCustomContext(context);
  }
}

function instrumentApmRoutes(apm: ApmBase, url: string) {
  if (apm) {
    const tx: Transaction = apm.startTransaction(url, "route-change", {
      managed: false,
      canReuse: false,
    });

    afterFrame(() => {
      tx && tx.isFinished();
    });
  }
}

export { useApm, ApmProvider, updateApmContext, instrumentApmRoutes };
