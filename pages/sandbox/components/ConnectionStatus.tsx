/* THIS CODE IS FOR SANDBOXING ONLY. */
/* TODO delete before merging PR */

import React from "react";
import { Switch, Case } from "react-if";
import { useWallet } from "use-wallet";

import SectionTitle from "../../../components/sectionTitle";
import { useEnvironment } from "../../../lib/contexts/useEnvironment";

const ConnectionStatus = () => {
  const { chainId: walletChainId, status } = useWallet();
  const { chainId } = useEnvironment();

  return (
    <>
      <SectionTitle title={"Voice Sandbox"} subtitle={"Testing Environment hook"} />
      <Switch>
        <Case condition={status === "connected"}>
          <p>You are currently connected</p>
          <p>UseWallet reports chain: {walletChainId}</p>
          <p>Environment hook reports chain: {chainId}</p>
        </Case>
        <Case condition={status === "disconnected"}>
          <p>You are currently not connected.</p>
          <p>Environment hook reports chain: {chainId}</p>
        </Case>
      </Switch>
    </>
  );
};

export default ConnectionStatus;
