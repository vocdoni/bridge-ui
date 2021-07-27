import React, { createContext, useContext, useState } from "react";
import { MsgType } from "../../types";

const UseMessageAlertContext = createContext({
  msgType: "error" as MsgType,
  closeToast: true,
  message: "",
  setAlertMessage: (msg: string, msgType?: MsgType, seconds?: number) => undefined,
  clearAlert: () => undefined,
});

export function useMessageAlert() {
  return useContext(UseMessageAlertContext);
}

export function UseMessageAlertProvider({ children }) {
  const [msgType, setMsgType] = useState("error" as MsgType);
  const [closeToast, setCloseToast] = useState(true);
  const [message, setMessage] = useState("");
  const [timeout, setTimeoutTracker] = useState(null);

  const setAlertMessage = (msg: string, messageType: MsgType = "error", seconds = 8) => {
    if (timeout) clearTimeout(timeout);

    setMessage(msg);
    setMsgType(messageType);
    setCloseToast(false);
    const newTo = setTimeout(() => {
      clearAlert();
      setTimeoutTracker(null);
    }, 1000 * seconds);
    setTimeoutTracker(newTo);
  };

  const clearAlert = () => {
    setCloseToast(true);
    setTimeout(() => {
      setMessage("");
    }, 500);
  };

  return (
    <UseMessageAlertContext.Provider
      value={{ msgType, message, setAlertMessage, clearAlert, closeToast }}
    >
      {children}
    </UseMessageAlertContext.Provider>
  );
}
