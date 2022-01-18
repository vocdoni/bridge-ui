import { useState, useCallback } from "react"

export const useForceUpdate = () => {
  const [, updateState] = useState<any>({})
  return useCallback(() => updateState({}), [])
}
