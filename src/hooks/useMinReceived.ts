import BigNumber from 'bignumber.js';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';

export default function useMinReceived(valueOveride?: BigNumber) {
  const { setMinReceived, slippage, token1, exactToken, token2, showConfirmTxDetails } = useContext(GlobalContext);

  const [outVal, setOutVal] = useState<BigNumber>(token1.value);

  useEffect(() => {
    if (valueOveride) {
      setOutVal(valueOveride);
    } else if (exactToken === 1) {
      setOutVal(token2.value);
    } else {
      setOutVal(token1.value);
    }
    const slip = outVal.times(slippage).div(100);
    const min = outVal.minus(slip);

    setMinReceived(min);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slippage, outVal, token1.value, token2.value, valueOveride, exactToken, showConfirmTxDetails]);
}
