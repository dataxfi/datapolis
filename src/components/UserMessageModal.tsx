import { useContext, useEffect, useState } from "react";
import { BsXCircle, BsX } from "react-icons/bs";
import { GlobalContext } from "../context/GlobalState";
export interface userMessage {
  message: any;
  link: string | { href: string; desc: string } | null;
  type: string;
}

const UserMessageModal = ({
  message,
  pulse = false,
  container = false,
  timeout = null,
}: {
  message: string | userMessage;
  pulse: boolean;
  container: boolean;
  timeout: null | { showState: Function; time: number };
}) => {
  let link: any;
  let userMessage;
  let type: any;
  let href;
  let desc;

  if (typeof message !== "string") {
    userMessage = message.message;
    link = message.link;
    type = message.type;
  }

  if (link && typeof link !== "string") {
    href = link.href;
    desc = link.desc;
  }

  const { notifications, setNotifications } = useContext(GlobalContext);
  const [messageOpacity, setMessageOpacity] = useState<number>(0);

  function easeInOut(time: number, state: Function) {
    setTimeout(() => {
      setMessageOpacity(100);
    }, 500);

    setTimeout(() => {
      setMessageOpacity(0);
    }, time - 500);

    setTimeout(() => {
      if (type === "alert") {
        state(null);
        const allNotifications = notifications;
        const newNotifications = allNotifications.slice(1);
        setNotifications(newNotifications);
      } else {
        state(false);
      }
    }, time);
  }

  useEffect(() => {
    if (timeout) {
      easeInOut(timeout.time, timeout.showState);
    } else {
      setMessageOpacity(100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stdMessageEl = (
    <div className="flex flex-col text-center">
      {type === "error" ? (
        <div className="flex justify-center">
          <BsXCircle className="text-red-500 text-4xl self-center mb-4" />{" "}
        </div>
      ) : null}
      <p
        className={` max-w-sm ${type === "error" ? "mb-4" : null} ${
          pulse ? "animate-pulse" : ""
        } opacity-${messageOpacity} transition-opacity duration-500`}
      >
        {userMessage ? userMessage : message}
      </p>
      {link ? (
        <a
          target="_blank"
          rel="noreferrer"
          className="text-primary-400 hover:text-primary-50"
          href={href ? href : link}
        >
          {desc ? desc : link}
        </a>
      ) : null}
    </div>
  );

  const floatMessageEl = (
    <div
      className={`max-w-xs fixed md:top-8 md:right-8 w-full mx-auto bg-primary-800 rounded-lg p-4 transition-opacity ease-in-out opacity-${messageOpacity} duration-500`}
    >
      <div className="flex justify-between items-start">
        <div className="grid grid-flow-col gap-4 items-center justify-center">
          <BsXCircle className="text-red-500 text-2xl self-center" />{" "}
          <div>
            <p>{userMessage ? userMessage : message}</p>
          </div>
        </div>
        <div>
          {timeout ? (
            <BsX
              role="button"
              color="white"
              onClick={() => {
                timeout.showState(false);
              }}
            />
          ) : null}
        </div>
      </div>
      {/* <div className="relative pt-1">
      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-400">
        <div className="bg-gray-900 h-full w-1/2"> </div>
      </div>
    </div> */}
    </div>
  );

  return type === "alert" ? (
    <>{floatMessageEl}</>
  ) : container ? (
    <div className="w-full h-4/5 flex flex-row justify-center p-4 pt-24">
      <div
        className={`h-1/3 text-center bg-gray-900 px-20 py-20 rounded-lg self-center `}
      >
        {stdMessageEl}
      </div>
    </div>
  ) : (
    stdMessageEl
  );
};

export default UserMessageModal;
