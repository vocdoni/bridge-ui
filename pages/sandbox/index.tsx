import React from "react";

import SectionTitle from "../../components/sectionTitle";
import ConnectionStatus from "./components/ConnectionStatus";
import UserHeldTokenSection from "./components/UserHeldToken";

const SandboxPage = () => {
  return (
    <>
      <SectionTitle title={"Voice Sandbox"} subtitle={"Testing Environment hook"} />
      <ConnectionStatus />
      <UserHeldTokenSection />
    </>
  );
};

export default SandboxPage;
