import { useEffect } from "react"

/** Scrolls to the top the first time the component is loaded */
export const useScrollTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
}
