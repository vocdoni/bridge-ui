import React, { useMemo, useContext, useState } from "react";
import { init as initApm } from "@elastic/apm-rum";
import { afterFrame } from "@elastic/apm-rum-core";
import { BUILD } from "../constants/env";

const UseAPMContext = React.createContext(null);

function ApmProvider({ children }) {
  const [apm, setApm] = useState(() =>
    initApm({
      serviceName: "Voice",
      serverUrl: "https://apm-monitoring.aragon.org",
      serviceVersion: BUILD.commitSha,
      environment: "dev", // TODO set this dynamically.
    })
  );

  const contextValue = useMemo(() => {
    return { apm, setApm };
  }, [apm, setApm]);

  return <UseAPMContext.Provider value={contextValue}>{children}</UseAPMContext.Provider>;
}

function useAPM() {
  return useContext(UseAPMContext);
}

function updateAPMContext(apm: any, networkType: string) {
  if (apm && networkType) {
    const context = { networkType: networkType };
    apm.addLabels(context);
    apm.setCustomContext(context);
  }
}

function instrumentApmRoutes(apm: any, routingMod: any) {
  if (apm && routingMod) {
    const { instanceId, instancePath, name, status } = routingMod;
    const path = status ? `${name}/${status}` : `${name}/${instanceId}${instancePath}`;

    const tx = apm.startTransaction(path, "route-change", {
      managed: false,
      canReuse: false,
    });

    afterFrame(() => {
      tx && tx.detectFinish();
    });
  }
}

export { useAPM, ApmProvider, updateAPMContext, instrumentApmRoutes };
