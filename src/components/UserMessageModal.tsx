import { useState } from "react";

const UserMessageModal = ({
  message,
  pulse = false,
  container = false,
  timeout = null,
}: {
  message: string;
  pulse: boolean;
  container: boolean;
  timeout: null | { showState: Function; time: number };
}) => {
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
    <p
      className={`${
        pulse ? "animate-pulse" : ""
      } opacity-${messageOpacity} transition-opacity duration-500`}
    >
      {message}
    </p>
  );

  return container ? (
    <div className="w-full h-4/5 flex flex-row justify-center p-4">
      <div
        className={`h-1/3 text-center bg-gray-900 px-10 py-20 rounded-lg self-center `}
      >
        {messageEl}
      </div>
    </div>
  ) : (
    messageEl
  );
};

export default UserMessageModal;
