import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";

export default function useWatchLocation (){
    const {location, setLocation} = useContext(GlobalContext)
    const currentLocation = useLocation()
    useEffect(()=>{
        setLocation(currentLocation.pathname)
    }, [currentLocation])
}