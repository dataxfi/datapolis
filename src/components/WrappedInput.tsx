import BigNumber from "bignumber.js";
import { useContext, useState } from "react";
import { GlobalContext, bgLoadingStates, removeBgLoadingState } from "../context/GlobalState";
/**
 * Use to check inputs before debounce input. On change will fire immediately and check:
 * - If number is over max
 * - If decimals are greater than 5 places
 * - If there are trailing or leading 0(s)
 * If any of these conditions pass, there is no need to call the debounced on change function.
 * @param props
 * @returns
 */

export default function WrappedInput(props: any) {
  const { bgLoading, setBgLoading } = useContext(GlobalContext);
  const [internalState, setInternalState] = useState<BigNumber>(new BigNumber(0));
  function shouldCallDBchange(e: any) {
    setBgLoading([...bgLoading, bgLoadingStates.calcTrade]);
    const value = e.target.value;
    console.log(value);
    const bnVal = new BigNumber(value);
    console.log(bnVal.toString());
    let result = true;

    const afterPeriod = /\.(.*)/;
    const decimals = value.match(afterPeriod);
    console.log(decimals);

    //dont call db change if decimals >= 5
    if (decimals && decimals[1].length > 5) {
      result = false;
    }

    //dont call db change if the input is the same as the current value (ie. trailing/leading zero(s))
    if (bnVal.toFixed(5) === internalState.toFixed(5)) {
      result = false;
    }

    setInternalState(bnVal);
    if(!result) setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.calcTrade))
    return result;
  }

  return (
    <input
      {...props}
      onChange={(e) => {          
        if (shouldCallDBchange(e)) {
          props.onChange(e);
        }
      }}
    />
  );
}
