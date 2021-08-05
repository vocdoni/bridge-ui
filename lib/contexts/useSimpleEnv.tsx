import { useState, useEffect } from "react";
import { NetworkVariables, getNetworkVars } from "../../constants/env";

/* NOTE NOT CURRENTLY USED */
// export function UseSimpleEnv(chainId) {
//   const newEnvironment = getNetworkVars(1);
//   const [environment, setEnvironment] = useState<NetworkVariables>(newEnvironment);

//   useEffect(() => {
//     console.log("// ==== EFFECT START ====");
//     let newEnvironment;
//     if (!chainId) {
//       console.log("UseWallet has no chainId");
//       newEnvironment = getNetworkVars(1);
//     } else {
//       console.log("UseWallet has chainId: " + chainId);
//       newEnvironment = getNetworkVars(chainId);
//     }
//     setEnvironment(newEnvironment);
//     console.log("\\\\ ==== EFFECT END ====");
//   }, [chainId]);

//   return environment;
// }
