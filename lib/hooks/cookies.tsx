import { useEffect, useState } from "react";

const COOKIES_STORE_KEY = "cookies-acceptance";

enum CookiesStatus {
  Accept = "accept",
}
export function useCookies() {
  const [show, setShow] = useState<boolean>(true);

  useEffect(() => {
    const cookieAcceptance = localStorage.getItem(COOKIES_STORE_KEY);

    if (cookieAcceptance && cookieAcceptance === CookiesStatus.Accept) {
      setShow(false);
    }
  }, []);

  const acceptCookies = () => {
    setShow(false);
    localStorage.setItem(COOKIES_STORE_KEY, CookiesStatus.Accept);
  };

  return { acceptCookies, show };
}
