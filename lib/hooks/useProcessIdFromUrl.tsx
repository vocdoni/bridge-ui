import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useUrlHash } from "use-url-hash";

import { HEX_REGEX } from "../regex";
import { useMessageAlert } from "./message-alert";

/**
 * This hook retrieves a valid processID from the URL or redirects the User to the
 * 'find-tokens' page.
 *
 * @returns A non-empty string, if the URL contains a valid string.
 */
export function useProcessIdFromUrl(): string {
  const router = useRouter();
  const pId = useUrlHash().substr(1);
  const [processId, setProcessId] = useState("");
  const { setAlertMessage } = useMessageAlert();

  useEffect(() => {
    if (typeof window != "undefined" && !pId.match(HEX_REGEX)) {
      setProcessId("");
      console.error("Invalid process ID", pId);
      router.replace("/tokens");
      setAlertMessage("The URL contains an invalid process ID. Redirecting to all tokens.");
    } else {
      setProcessId(pId);
    }
  }, []);

  return processId;
}
