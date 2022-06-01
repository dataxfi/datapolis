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

    const slip = outVal.times(slippage).div(100);
    const min = exactToken === 1 ? outVal.minus(slip) : outVal.plus(slip);

    setAfterSlippage(min);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slippage, outVal, tokenIn.value, tokenOut.value, valueOveride, exactToken, showConfirmTxDetails]);
}
