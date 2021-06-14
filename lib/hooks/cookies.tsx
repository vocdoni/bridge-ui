import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const COOKIES_STORE_KEY = 'cookies-acceptance'

enum CookiesStatus {
  Accept = 'accept',
  Reject = 'reject',
}
export function useCookies() {
  const [accepted, setAccepted] = useState<boolean>(false)
  const [hide, setHide] = useState<boolean>(false)

  const router = useRouter()

  useEffect(() => {
    const cookieAcceptance = localStorage.getItem(COOKIES_STORE_KEY)

    if (cookieAcceptance) {
      setAccepted(cookieAcceptance === CookiesStatus.Accept)
    }
  }, [])

  const acceptCookies = () => {
    setAccepted(true)
    setHide(true)
    localStorage.setItem(COOKIES_STORE_KEY, CookiesStatus.Accept)
  }

  const rejectCookies = () => {
    setAccepted(false)
    setHide(true)
    localStorage.setItem(COOKIES_STORE_KEY, CookiesStatus.Reject)
  }

  return { acceptCookies, rejectCookies, accepted, hide }
}
