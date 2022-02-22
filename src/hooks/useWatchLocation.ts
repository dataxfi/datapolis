import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";

export default function useWatchLocation() {
  const {setLocation} = useContext(GlobalContext);
  const currentLocation = useLocation();
  useEffect(() => {
    console.log(currentLocation);
    if (setLocation) setLocation(currentLocation.pathname);
  }, [currentLocation, setLocation]);
}
