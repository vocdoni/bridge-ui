import { createContext, useContext, useState } from "react"

const UseLoadingAlertContext = createContext({ message: "", setLoadingMessage: (msg: string) => { }, hideLoading: () => { } })

export function useLoadingAlert() {
    return useContext(UseLoadingAlertContext)
}

export function UseLoadingAlertProvider({ children }) {
    const [message, setMessage] = useState("")

    const hideLoading = () => setMessage("")

    return <UseLoadingAlertContext.Provider value={{ message, setLoadingMessage: setMessage, hideLoading }}>
        {children}
    </UseLoadingAlertContext.Provider>
}
