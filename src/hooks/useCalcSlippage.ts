import BigNumber from 'bignumber.js';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';

export default function useCalcSlippage(valueOveride?: BigNumber) {
  const { setAfterSlippage, slippage, tokenIn, exactToken, tokenOut, showConfirmTxDetails } = useContext(GlobalContext);

  const [outVal, setOutVal] = useState<BigNumber>(tokenIn.value);

  useEffect(() => {
    if (valueOveride) {
      setOutVal(valueOveride);
    } else if (exactToken === 1) {
      setOutVal(tokenOut.value);
    } else {
      setOutVal(tokenIn.value);
    }

    const min = calcSlippage(outVal, slippage, exactToken);

    setAfterSlippage(min);
  }, [slippage, outVal, tokenIn.value, tokenOut.value, valueOveride, exactToken, showConfirmTxDetails]);
}

export function calcSlippage(amt: BigNumber, slippage: BigNumber, exactToken: 1 | 2) {
  console.log('Before slippage', amt.toString());
  const slip = amt.times(slippage).div(100);
  return exactToken === 1 ? amt.minus(slip) : amt.plus(slip);
}
