import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalState";

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
        localStorage.setItem("cookiesAllowed", "false");
        setShow(true);
        break;
    }
  }, []);

  function confirmOrDeny(e: any) {
    if (e.target.id === "confirmCookies") {
      localStorage.setItem("cookiesAllowed", "true");
      setCookiesAllowed(true)
    } else {
      localStorage.setItem("cookiesAllowed", "false");
    }

    setShow(false)
  }

  return (
    <div className={`w-96 absolute bottom-0 flex flex-col bg-primary-700 p-5 justify-center m-4 rounded-md shadow-2xl ${show? "block" : "hidden"}`}>
      <h2 className="font-bold text-xl self-center">Cookie Notice</h2>
      <p className="my-2">
        DataX stores cookies to enable features and enhance user experience.
        Please confirm or deny the use of cookies. (You must accept cookies to
        connect to your wallet.)
      </p>
      <button
        onClick={confirmOrDeny}
        className="p-2 w-full rounded-sm bg-primary-600 hover:bg-primary-500"
        id="confirmCookies"
      >
        Confirm
      </button>
      <button
        onClick={confirmOrDeny}
        className="p-2 mt-2 rounded-sm w-full bg-primary-600 hover:bg-primary-500"
        id="denyCookies"
      >
        Deny
      </button>
    </div>
  );
}

export default CookiesModal;
