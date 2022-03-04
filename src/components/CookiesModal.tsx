import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import {acceptsCookiesGA} from '../context/Analytics'
function CookiesModal() {
  const { setCookiesAllowed } = useContext(GlobalContext);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if(!setCookiesAllowed) return
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCookiesAllowed]);

  function confirmOrDeny(e: React.MouseEvent<HTMLButtonElement>) {
    if(!setCookiesAllowed) return
    const target = e.target as Element
    if (target.id === "confirmCookies") {
      localStorage.setItem("cookiesAllowed", "true");
      setCookiesAllowed(true)
      acceptsCookiesGA()
      
    } else {
      localStorage.setItem("cookiesAllowed", "false");
      setCookiesAllowed(false)
    }

    setShow(false)
  }

  return (
    <div id="cookiesModal"
      className={`z-30 md:w-80 lg:w-96 absolute bottom-0 flex flex-col bg-black bg-opacity-90 p-5 justify-center m-4 rounded-md filter hm-box transition-all ${
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
        className="txButton rounded-lg text-center mb-2 p-2"
        id="confirmCookies"
      >
        Confirm
      </button>
      <button
        onClick={confirmOrDeny}
        className="txButton rounded-lg text-center p-2"
        id="denyCookies"
      >
        Deny
      </button>
    </div>
  );
}

export default CookiesModal;
