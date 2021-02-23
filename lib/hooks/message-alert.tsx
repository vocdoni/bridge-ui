import { createContext, useContext, useState } from "react"

const UseMessageAlertContext = createContext({ message: "", setAlertMessage: (msg: string, seconds?: number) => { }, clearAlert: () => { } })

export function useMessageAlert() {
    return useContext(UseMessageAlertContext)
}

export function UseMessageAlertProvider({ children }) {
    const [message, setMessage] = useState("")
    const [timeout, setTimeoutTracker] = useState(null)

    const setAlertMessage = (msg: string, seconds: number = 8) => {
        if (timeout) clearTimeout(timeout)

        setMessage(msg)
        const newTo = setTimeout(() => {
            clearAlert()
            setTimeoutTracker(null)
        }, 1000 * seconds)
        setTimeoutTracker(newTo)
    }
    const clearAlert = () => setMessage("")

    return <UseMessageAlertContext.Provider value={{ message, setAlertMessage, clearAlert }}>
        {children}
    </UseMessageAlertContext.Provider>
}
