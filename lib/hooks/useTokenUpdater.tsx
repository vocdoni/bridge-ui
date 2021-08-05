/* THIS CODE IS FOR SANDBOXING ONLY. */
/* TODO delete before merging PR */

import { usePool } from "@vocdoni/react-hooks";
import { useEffect } from "react";
import { getRegisteredTokenList } from "../api";
import { VoiceStorage } from "../storage";
import { useMessageAlert } from "./../contexts/message-alert";
import { useEnvironment } from "./../contexts/useEnvironment";

/**
 *
 * @returns List of registered addresses, a loading indicator and an error (or null, if
 * there is none).
 */
export function useTokenUpdater() {
  const { poolPromise } = usePool();
  const { setAlertMessage } = useMessageAlert();
  const { networkName } = useEnvironment();

  useEffect(() => {
    async function getTokenList() {
      console.log("UPDATING FOR " + networkName);
      try {
        const db = new VoiceStorage();
        const [pool, tokensInDbCount] = await Promise.all([
          poolPromise,
          db.getNumberOfTokens(networkName),
        ]);
        const tokens = await getRegisteredTokenList(tokensInDbCount, pool);
        console.log("NUMBER OF TOKENS IN MEM " + tokensInDbCount);
        console.log(tokens);
      } catch (error) {
        console.error("Error when updating registered tokens: " + error);
        setAlertMessage("There was an error when updating registered tokens.");
        console.log("just hoping to trigger changes");
      }
    }
    getTokenList();
  }, [poolPromise]);
}
