import { useState } from "react";
import { BsXCircle } from "react-icons/bs";
export interface userMessage {
  message: string;
  link: string;
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
  let link;
  let userMessage;
  let type;

  if (typeof message != "string") {
    userMessage = message.message;
    link = message.link;
    type = message.type;
  }

  const [messageOpacity, setMessageOpacity] = useState<number>(100);

  function callTimeout(time: number, state: Function) {
    setTimeout(() => {
      state(false);
    }, time + 1000);
  }

  function fadeOut(time: number) {
    setTimeout(() => {
      setMessageOpacity(0);
    }, time);
  }

  if (timeout) {
    callTimeout(timeout.time, timeout.showState);
    fadeOut(timeout.time);
  }

  const messageEl = (
    <div className="flex flex-col text-center">
      {type === "error" ? (
        <div className="flex justify-center">
          <BsXCircle className="text-red-500 text-4xl self-center mb-4" />{" "}
        </div>
      ) : null}
      <p
        className={` max-w-sm mb-4 ${
          pulse ? "animate-pulse" : ""
        } opacity-${messageOpacity} transition-opacity duration-500`}
      >
        {userMessage ? userMessage : message}
      </p>
      {link ? (
        <a
          target="_blank"
          className="text-primary-400 hover:text-primary-50"
          href={link}
        >
          {link}
        </a>
      ) : null}
    </div>
  );

  return container ? (
    <div className="w-full h-4/5 flex flex-row justify-center p-4 pt-24">
      <div
        className={`h-1/3 text-center bg-gray-900 px-20 py-20 rounded-lg self-center `}
      >
        {messageEl}
      </div>
    </div>
  ) : (
    messageEl
  );
};

export default UserMessageModal;
