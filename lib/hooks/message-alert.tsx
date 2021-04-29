import React, { createContext, useContext, useState } from "react";

const UseMessageAlertContext = createContext({
  isError: true,
  message: "",
  setAlertMessage: (msg: string, isErr?: boolean, seconds?: number) => undefined,
  clearAlert: () => undefined,
});

export function useMessageAlert() {
  return useContext(UseMessageAlertContext);
}

export function UseMessageAlertProvider({ children }) {
  const [isError, setIsError] = useState(true);
  const [message, setMessage] = useState("");
  const [timeout, setTimeoutTracker] = useState(null);

  const setAlertMessage = (msg: string, isErr = true, seconds = 8) => {
    if (timeout) clearTimeout(timeout);

    setMessage(msg);
    setIsError(isErr);
    const newTo = setTimeout(() => {
      clearAlert();
      setTimeoutTracker(null);
    }, 1000 * seconds);
    setTimeoutTracker(newTo);
  };
  const clearAlert = () => setMessage("");

  return (
    <UseMessageAlertContext.Provider value={{ isError, message, setAlertMessage, clearAlert }}>
      {children}
    </UseMessageAlertContext.Provider>
  );
}
