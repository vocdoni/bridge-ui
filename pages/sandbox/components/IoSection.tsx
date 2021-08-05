/* THIS CODE IS FOR SANDBOXING ONLY. */
/* TODO delete before merging PR */

import React from "react";
import { If, Then, Else } from "react-if";

import { useStoredTokens } from "../../../lib/contexts/tokens";

const StoredTokenTesting = () => {
  const { data, isLoading } = useStoredTokens();
  return (
    <If condition={isLoading}>
      <Then>
        <p>Loading tokens...</p>
      </Then>
      <Else>
        <p>Loading done!</p>
        <p>The count of loaded token info is: {data.length}</p>
      </Else>
    </If>
  );
};

export default StoredTokenTesting;
