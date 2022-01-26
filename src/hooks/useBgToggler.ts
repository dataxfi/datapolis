import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";

export default function useBgToggler (){
    const {location, setLocation} = useContext(GlobalContext)
    const currentLocation = useLocation()
    useEffect(()=>{
        console.log(currentLocation);
        setLocation(currentLocation.pathname)
    }, [currentLocation])
}