/* THIS CODE IS FOR SANDBOXING ONLY. */
/* TODO delete before merging PR */

import React from "react";
import { Else, If, Then } from "react-if";
import { useEnvironment } from "../../../lib/hooks/context/useEnvironment";
import { useFeaturedTokens } from "../../../lib/hooks/useFeaturedTokens";

const FeaturedTokensSection = () => {
  const e = useEnvironment();
  const x = useFeaturedTokens();

  return (
    <If condition={x.isLoading}>
      <Then>
        <p>The featured tokens are loading...</p>
      </Then>
      <Else>
        <p>
          There are currently {x.data.length} featured tokens on network {e.networkName}.
        </p>
        <p>Their infos are</p>
        {x.data.map((t, i) => (
          <p key={i}>
            1. {t.address} - {t.symbol}
          </p>
        ))}
      </Else>
    </If>
  );
};

export default FeaturedTokensSection;
