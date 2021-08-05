/* THIS CODE IS FOR SANDBOXING ONLY. */
/* TODO delete before merging PR */

import React, { useState } from "react";
import { If, Then, Else } from "react-if";
import { usePool } from "@vocdoni/react-hooks";

import { getTokenInfo } from "../../../lib/api";
import { useMessageAlert } from "../../../lib/hooks/context/message-alert";
import { useRegisteredTokens } from "../../../lib/hooks/useRegisteredTokens";

function getSlices(inc, curr, max): [number, number] {
  if (curr + inc < max) return [curr, curr + inc];
  return [curr, max];
}

const ChunkFetching = () => {
  const inc = 40;
  const { poolPromise } = usePool();
  const { data: registeredTokens, isLoading: registeredTokensLoading } = useRegisteredTokens();
  const { setAlertMessage } = useMessageAlert();

  const [tokenCheckIndex, setTokenCheckIndex] = useState(0);

  const [lo, hi] = getSlices(inc, tokenCheckIndex, registeredTokens.length);

  const handleTokenCheck = async () => {
    console.log(`Checking token ${lo + 1}-${hi} ===============`);

    try {
      const pool = await poolPromise;
      const addrs = registeredTokens.slice(lo, hi);
      const tokenInfos = await Promise.all(addrs.map((a) => getTokenInfo(a, pool)));
      tokenInfos.forEach((t) => console.log(`Checked address ${t.address} of ${t.symbol}`));

      setTokenCheckIndex(tokenCheckIndex + inc);
    } catch (error) {
      setAlertMessage(`Checking an address in range ${lo + 1}-${hi} failed:`);
      console.log(error);
    }
  };

  const hendleResetCounter = () => {
    setTokenCheckIndex(0);
  };

  return (
    <If condition={registeredTokensLoading}>
      <Then>
        <p>Loading tokens...</p>
      </Then>
      <Else>
        <p>Checking token fetching individually:</p>
        <button onClick={handleTokenCheck} disabled={!registeredTokens || registeredTokensLoading}>
          Check Token {lo + 1}-{hi}
        </button>
        <button onClick={hendleResetCounter}>Reset Counter</button>
        <p></p>
      </Else>
    </If>
  );
};

export default ChunkFetching;
