import { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";

export default function BGToggle() {
  const {bgOff, setBgOff} = useContext(GlobalContext);
  return (
    <button
      onClick={() => {
        if(setBgOff)setBgOff(!bgOff);
        localStorage.setItem("bgPref", String(!bgOff))
      }}
      className="mx-4 p-3 w-12 h-4 bg-black bg-opacity-60 rounded-full relative shadow-lg"
    >
      <div
        className={`bg-white w-4 h-4 rounded-full absolute bottom-1 duration-200 transition-all ease-in-out transform shadow-lg ${
          bgOff ? "left-7" : "left-1"
        }`}
      ></div>
    </button>
  );
}
