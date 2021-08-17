import React, { useContext, useEffect, useState } from "react";
import { usePool } from "@vocdoni/react-hooks";
import { GatewayPool } from "dvote-js";
import { BigNumber } from "@ethersproject/bignumber";

import { getRegisteredTokenList, getTokenInfo } from "../../api";
import { useMessageAlert } from "../message-alert";
import { VoiceStorage } from "../../storage";
import { TokenInfo, UseData } from "../../types";
import { OutsideProviderError } from "../../errors";
import { useEnvironment } from "../useEnvironment";
import useWallet from "use-wallet";

/*  NOTE NOT CURRENTLY USED */
// type RegisteredTokens = UseData<string[]> & {
//   refresh: () => Promise<any>;
// };

// const UseRegisteredTokensContext = React.createContext<RegisteredTokens>(null);

// /**
//  * Returns an array containing the list of registered ERC20 tokens.
//  * The list is persisted on IndexDB
//  * */
// export function useRegisteredTokens() {
//   const tokenContext = useContext(UseRegisteredTokensContext);

//   if (tokenContext === null) {
//     throw new OutsideProviderError("useRegisteredTokens()", "<useRegisteredTokensProvider />");
//   }
//   return tokenContext;
// }

// // These are the tokens we want to show at first
// // Convert this to an array of tokens
// export function UseRegisteredTokensProvider({ children }) {
//   const { networkName } = useEnvironment();
//   const { poolPromise } = usePool();
//   const { setAlertMessage } = useMessageAlert();
//   // const { chainId } = useWallet();

//   const [storedTokens, setStoredTokens] = useState<TokenInfo[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");

//   useEffect(() => {
//     async function getTokenList() {
//       console.log("UPDATING FOR " + networkName);
//       try {
//         const db = new VoiceStorage();
//         const [pool, tokensInDbCount] = await Promise.all([
//           poolPromise,
//           db.getNumberOfTokens(networkName),
//         ]);
//         const tokens = await getRegisteredTokenList(tokensInDbCount, pool);
//         console.log("NUMBER OF TOKENS IN MEM " + tokensInDbCount);
//         console.log(tokens);
//       } catch (error) {
//         console.error("Error when updating registered tokens: " + error);
//         setAlertMessage("There was an error when updating registered tokens.");
//         console.log("just hoping to trigger changes");
//       }
//     }
//     getTokenList();
//   }, [poolPromise]);

//   // useEffect(() => {
//   //   readFromStorage() // IndexDB
//   //     .then(() => {
//   //       console.log("STORED TOKEN FROM PROVIDER: " + storedTokens);
//   //       fetchNewStoredTokens();
//   //     }); // Web3
//   // }, []);

//   /** Reads the current token info array fron IndexDB */
//   const readFromStorage = () => {
//     const storage = new VoiceStorage();

//     return storage.readTokens(networkName).then((storedTokens) => {
//       const result: TokenInfo[] = (storedTokens || []).map((item) => {
//         return {
//           totalSupply: BigNumber.from(item.totalSupply?._hex || item.totalSupply),
//           ...item,
//         };
//       });
//       setStoredTokens(result);
//     });
//   };

//   /** Persists any of the given tokens into IndexedDB. If they already exist, it overwrites their values. */
//   const writeToStorage = (tokens: TokenInfo[]) => {
//     const storage = new VoiceStorage();

//     return storage.writeTokens(tokens, networkName);
//   };

//   //   const fetchNewStoredTokens = () => {
//   //     let pool: GatewayPool;
//   //     setLoading(true);

//   //     return poolPromise
//   //       .then((p) => {
//   //         pool = p;
//   //         return getRegisteredTokenList(storedTokens?.length || 0, p);
//   //       })
//   //       .then((tokenList) => {
//   //         // Fetches the details of the non-stored tokens
//   //         const newTokens: string[] = [];
//   //         for (let i = 0; i < tokenList.length; i++) {
//   //           const included = storedTokens.some(
//   //             (t) => t.address.toLowerCase() == tokenList[i].toLowerCase()
//   //           );
//   //           if (included) continue;

//   //           newTokens.push(tokenList[i]);
//   //         }
//   //         return Promise.all(newTokens.map((addr) => getTokenInfo(addr, pool)));
//   //       })
//   //       .then((newTokenListInfo) => {
//   //         setLoading(false);
//   //         setError(null);

//   //         setStoredTokens(storedTokens.concat(newTokenListInfo));
//   //         writeToStorage(newTokenListInfo);
//   //       })
//   //       .catch((err) => {
//   //         setLoading(false);
//   //         /* Errors can get too large and specific to display as toast to users. Use
//   // abbreviated message i toast and explicit message in console */
//   //         console.error("Could not update the list of tokens because: " + err);
//   //         setError("Could not update the list of tokens");
//   //       });
//   //   };

//   useEffect(() => {
//     if (error) setAlertMessage(error);
//   }, [error]);

//   return (
//     <UseRegisteredTokensContext.Provider
//       value={{
//         storedTokens,
//         // storeTokens: writeToStorage,
//         // refresh: fetchNewStoredTokens,
//         error,
//         loading,
//       }}
//     >
//       {children}
//     </UseRegisteredTokensContext.Provider>
//   );
// }
