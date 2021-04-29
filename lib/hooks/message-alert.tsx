import React, { createContext, useContext, useState } from "react";

const UseMessageAlertContext = createContext({
  error: true,
  message: "",
  setAlertMessage: (msg: string, error?: boolean, seconds?: number) => undefined,
  clearAlert: () => undefined,
});

export function useMessageAlert() {
  return useContext(UseMessageAlertContext);
}

export function UseMessageAlertProvider({ children }) {
  const [error, setError] = useState(true);
  const [message, setMessage] = useState("");
  const [timeout, setTimeoutTracker] = useState(null);

  const setAlertMessage = (msg: string, error=true, seconds = 8) => {
    if (timeout) clearTimeout(timeout);

    setMessage(msg);
    setError(error);
    const newTo = setTimeout(() => {
      clearAlert();
      setTimeoutTracker(null);
    }, 1000 * seconds);
    setTimeoutTracker(newTo);
  };
  const clearAlert = () => setMessage("");

  return (
    <UseMessageAlertContext.Provider value={{ error, message, setAlertMessage, clearAlert }}>
      {children}
    </UseMessageAlertContext.Provider>
  );
}
