import React, { createContext, useContext, useState } from "react";
import { MsgType } from "../types";

const UseMessageAlertContext = createContext({
  msgType: "error" as MsgType,
  message: "",
  setAlertMessage: (msg: string, msgType?: MsgType, seconds?: number) => undefined,
  clearAlert: () => undefined,
});

export function useMessageAlert() {
  return useContext(UseMessageAlertContext);
}

export function UseMessageAlertProvider({ children }) {
  const [msgType, setMsgType] = useState("error" as MsgType);
  const [message, setMessage] = useState("");
  const [timeout, setTimeoutTracker] = useState(null);

  const setAlertMessage = (msg: string, messageType: MsgType = "error", seconds = 8) => {
    if (timeout) clearTimeout(timeout);

    setMessage(msg);
    setMsgType(messageType);
    const newTo = setTimeout(() => {
      clearAlert();
      setTimeoutTracker(null);
    }, 1000 * seconds);
    setTimeoutTracker(newTo);
  };
  const clearAlert = () => setMessage("");

  return (
    <UseMessageAlertContext.Provider value={{ msgType, message, setAlertMessage, clearAlert }}>
      {children}
    </UseMessageAlertContext.Provider>
  );
}
