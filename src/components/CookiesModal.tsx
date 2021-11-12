import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import {acceptsCookiesGA, deniedCookiesGA} from '../context/Analytics'
function CookiesModal() {
  const { setCookiesAllowed } = useContext(GlobalContext);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const cookiePreference = localStorage.getItem("cookiesAllowed");
    switch (cookiePreference) {
      case "true":
        setCookiesAllowed(true);
        break;
      case "false":
        setCookiesAllowed(false);
        setShow(true)
        break;
      default:
        localStorage.setItem("cookiesAllowed", "null");
        setShow(true);
        break;
    }
  }, []);

  function confirmOrDeny(e: any) {
    if (e.target.id === "confirmCookies") {
      localStorage.setItem("cookiesAllowed", "true");
      setCookiesAllowed(true)
      acceptsCookiesGA()
      
    } else {
      localStorage.setItem("cookiesAllowed", "false");
      deniedCookiesGA()
    }

    setShow(false)
  }

  return (
    <div
      className={`z-30 md:w-80 lg:w-96 absolute bottom-0 flex flex-col bg-primary-700 p-5 justify-center m-4 rounded-md filter hm-box transition-all ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <h2 className="font-bold lg:text-xl self-center">Help us improve!</h2>
      <p className="my-2 xs:text-xs sm:text-sm lg:text-base">
        We collect anonymised and aggregated usage stats of DataX products. We
        do not collect any personally identifiable data. Please select 'Confirm'
        to help DataX improve and enrich your user experience. You may also
        select 'Deny' to only store information essential to the functionality
        of the application.
      </p>

      <button
        onClick={confirmOrDeny}
        className="p-2 w-full xs:text-xs sm:text-sm rounded-sm bg-primary-600 hover:bg-primary-500"
        id="confirmCookies"
      >
        Confirm
      </button>
      <button
        onClick={confirmOrDeny}
        className="p-2 mt-2 xs:text-xs sm:text-sm rounded-sm w-full bg-primary-600 hover:bg-primary-500"
        id="denyCookies"
      >
        Deny
      </button>
    </div>
  );
}

export default CookiesModal;
