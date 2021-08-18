import router from "next/router";
import { useEffect, useState } from "react";
import { useMessageAlert } from "../contexts/message-alert";
import { useEnvironment } from "../contexts/useEnvironment";

export function useNetworkChange() {
  const { chainId: newNetwork, networkName } = useEnvironment();
  const { setAlertMessage } = useMessageAlert();

  const [currNetwork, setCurrNetwork] = useState(newNetwork);

  useEffect(() => {
    if (currNetwork !== newNetwork) {
      setCurrNetwork(newNetwork);
      setAlertMessage(`This page does not exist on ${networkName}. Sending you back to Home.`);
      router.push("/");
    }
  }, [newNetwork]);
}
