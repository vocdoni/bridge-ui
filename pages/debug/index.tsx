import { usePool } from "@vocdoni/react-hooks";
import React, { useState } from "react";
import { If, Then, Else } from "react-if";
import SectionTitle from "../../components/sectionTitle";

import { getTokenInfo } from "../../lib/api";
import { useMessageAlert } from "../../lib/hooks/message-alert";
import { useRegisteredTokenAddresses } from "../../lib/hooks/tokens/useRegisteredTokens";

function getSlices(inc: number, curr: number, max: number): [number, number] {
  if (inc + curr < max) {
    return [curr, inc + curr];
  }
  return [curr, max];
}

const IoSection = () => {
  const { poolPromise } = usePool();
  const {
    data: registeredTokens,
    isLoading: registeredTokensLoading,
  } = useRegisteredTokenAddresses();
  const { setAlertMessage } = useMessageAlert();

  const v = 5;
  const [tokenCheckIndex, setTokenCheckIndex] = useState<number>(0);
  const [chunkSize, setChunkSize] = useState<number>(v);
  const [lo, hi] = getSlices(chunkSize, tokenCheckIndex, registeredTokens.length);

  const handleTokenCheck = async () => {
    console.log(`Checking token ${lo + 1}-${hi} ===============`);

    try {
      const pool = await poolPromise;
      const addressChunk = registeredTokens.slice(lo, hi);
      const tokenInfos = await Promise.all(addressChunk.map((a) => getTokenInfo(a, pool)));

      tokenInfos.forEach((t) => console.log(`Checked address ${t.address} of ${t.symbol}`));

      setTokenCheckIndex(tokenCheckIndex + chunkSize);
    } catch (error) {
      setAlertMessage(`Checking an address in range ${lo + 1}-${hi} failed:`);
      console.log(error);
    }
  };

  const handleResetCounter = () => {
    setTokenCheckIndex(0);
  };

  const inputChangeHandler = (event) => {
    const newChunk: number = parseInt(event.target.value) as number;
    setChunkSize(newChunk);
  };

  return (
    <>
      <SectionTitle title={"Token Info Debugging"} />
      <If condition={registeredTokensLoading}>
        <Then>
          <p>Loading tokens...</p>
        </Then>
        <Else>
          <p>Got {registeredTokens.length} registered token addresses to check</p>
          <p>Chunk size of tokens to fetch {chunkSize}</p>
          <div>
            <input type="text" onChange={inputChangeHandler} defaultValue={v} />
          </div>
          <button
            onClick={handleTokenCheck}
            disabled={!registeredTokens || registeredTokensLoading}
          >
            Check Tokens {lo + 1}-{hi}
          </button>
          <button onClick={handleResetCounter}>Reset Counter</button>
          <p></p>
        </Else>
      </If>
    </>
  );
};

export default IoSection;
