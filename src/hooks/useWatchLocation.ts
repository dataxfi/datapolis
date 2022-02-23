import { useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";

export default function useWatchLocation() {
  const { setLocation } = useContext(GlobalContext);
  const currentLocation = useLocation();
  const lastLocation = useRef(currentLocation);
  useEffect(() => {
    setLocation(currentLocation.pathname);
    lastLocation.current = currentLocation
  }, [currentLocation, setLocation]);
}
