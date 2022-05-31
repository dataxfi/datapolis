import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';

export default function ConfirmTxItem({ pos }: { pos: 1 | 2 }) {
  const { token1, token2, location, lastTx, preTxDetails } = useContext(GlobalContext);

  return (
    <div className="flex justify-between items-center">
      <div className="grid grid-flow-col items-center gap-4 justify-start">
        {pos === 1 ? (
          <img src={token1.info?.logoURI} className="rounded-lg w-10" alt="" />
        ) : (
          <img src={token2.info?.logoURI} className="rounded-lg w-10" alt="" />
        )}

        <p className="text-gray-100 text-lg">
          {pos === 1
            ? token1.value.dp(5).toString()
            : location === '/stake'
            ? preTxDetails?.shares?.dp(5).toString()
            : token2.value.dp(5).toString()}
        </p>
      </div>
      <p
        id={`confirmSwapItem${pos === 1 ? token1.info?.symbol : token2.info?.symbol}`}
        className="justify-self-end text-gray-100 text-lg pr-2"
      >
        {pos === 1 ? token1.info?.symbol : token2.info?.symbol}
        {location === '/stake' && pos === 2 ? '/OCEAN Shares' : ''}
      </p>
    </div>
  );
}
