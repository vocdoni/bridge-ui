import router from "next/router";
import { useEffect, useState } from "react";
import { useMessageAlert } from "../contexts/message-alert";
import { useEnvironment } from "../contexts/useEnvironment";

/**
 * USE THIS HOOK ON NETWORK-SPECIFIC PAGES.
 *
 * Some pages on Voice are specific to networks. For example, tokens are specific to their
 * networks (ANT on rinkeby is different than ANT on mainnet). This means that the page
 * that displays information about that token is also specific to the network. If a user
 * changes network on such a page, the user is sent back to home ("/"). If the user has
 * switchtedo a supported network, the page will load content from that page. Otherwise,
 * it will default back to mainnet.
 */
export function useOnNetworkChange() {
  const { chainId: newNetwork, networkName } = useEnvironment();
  const { setAlertMessage } = useMessageAlert();

  const [currNetwork, setCurrNetwork] = useState(newNetwork);

  useEffect(() => {
    if (currNetwork !== newNetwork) {
      setCurrNetwork(newNetwork);
      setAlertMessage(`This page does not exist on ${networkName}.`);
      router.replace("/");
    }
  }, [newNetwork]);
}
