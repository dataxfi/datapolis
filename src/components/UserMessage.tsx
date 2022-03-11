import { useEffect, useState } from "react";
import { BsXCircle } from "react-icons/bs";
import { IUserMessage } from "../utils/types";

const UserMessage = ({
  id,
  message,
  pulse = false,
  container = false,
}: {
  id?: string | null;
  message: string | IUserMessage;
  pulse: boolean;
  container: boolean;
}) => {
  let link: any;
  let userMessage;
  let type: any;
  let href;
  let desc;
  if (!id) id = "UserMessage";
  if (typeof message !== "string") {
    userMessage = message.message;
    link = message.link;
    type = message.type;
  }

  if (link && typeof link !== "string") {
    href = link.href;
    desc = link.desc;
  }

  const [messageOpacity, setMessageOpacity] = useState<number>(0);

  useEffect(() => {
    setMessageOpacity(100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stdMessageEl = (
    <div id={id} className="flex flex-col text-center">
      {type === "error" ? (
        <div className="flex justify-center">
          <BsXCircle className="text-red-500 text-4xl self-center mb-4" />{" "}
        </div>
      ) : null}
      <p
        className={` max-w-sm ${type === "error" ? "mb-4" : ""} ${
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

  return container ? (
    <div className="w-full h-4/5 flex flex-row justify-center">
      <div className={`text-center bg-black bg-opacity-80 p-20 rounded-lg self-center`}>{stdMessageEl}</div>
    </div>
  ) : (
    stdMessageEl
  );
};

export default UserMessage;
