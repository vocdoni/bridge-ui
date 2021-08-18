/* THIS CODE IS FOR SANDBOXING ONLY. */
/* TODO delete before merging PR */

import React from "react";
import { Case, Default, Switch } from "react-if";
import { useTokensWithBalance } from "../../../lib/contexts/tokens";
import { useEnvironment } from "../../../lib/contexts/useEnvironment";

const UserHeldTokenSection = () => {
  const e = useEnvironment();
  const x = useTokensWithBalance();

  return (
    <Switch>
      <Case condition={x.isLoading}>
        <p>The featured tokens are loading...</p>
      </Case>
      <Case condition={!x.data || !x.data.length}>
        <p>There are no tokens. Make sure wallet is connected</p>
      </Case>
      <Default>
        <p>
          There are currently {x.data.length} featured tokens on network {e.networkName}.
        </p>
        <p>Their infos are</p>
        {x.data.map((t, i) => (
          <p key={i}>
            1. {t.address} - {t.symbol}
          </p>
        ))}
      </Default>
    </Switch>
  );
};

export default UserHeldTokenSection;
