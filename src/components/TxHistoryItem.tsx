import { useContext, useEffect, useState } from 'react';
import { BsBoxArrowUpRight } from 'react-icons/bs';
import { PulseLoader } from 'react-spinners';
import { GlobalContext } from '../context/GlobalState';
import { ITxDetails } from '../@types/types';

export default function TxHistoryItem({
  index,
  tx,
  setTx,
}: {
  index: number;
  tx: ITxDetails;
  setTx: React.Dispatch<React.SetStateAction<ITxDetails | undefined>>;
}) {
  const { watcher, web3, accountId, config, stake } = useContext(GlobalContext);
  const [txLink, setTxLink] = useState<string>(`${config?.default.explorerUri}/address/${accountId}`);
  const [txInstance, setTxInstance] = useState<ITxDetails>(tx);
  const [baseToken, setBaseToken] = useState<string>();

  useEffect(() => {
    if (tx.txType !== 'swap' && tx.pool) {
      stake?.getBaseToken(tx.pool.address).then(setBaseToken);
    }
  }, [tx.txType]);

  useEffect(() => {
    setTxInstance(tx);

    if (tx.status !== 'Success' && watcher && web3 && tx.txReceipt) {
      watcher
        .waitTransaction(web3, tx.txReceipt.transactionHash, {
          interval: 250,
          blocksToWait: 1,
        })
        .then(() => {
          setTxInstance({ ...tx, status: 'Success' });
          setTx({ ...tx, status: 'Success' });
        });
    }

    if (tx.txReceipt && config) {
      setTxLink(config.default.explorerUri + '/tx/' + tx.txReceipt.transactionHash);
    } else if (config) {
      setTxLink(`${config?.default.explorerUri}/address/${accountId}`);
    }
  }, [tx]);

  function exactTime(tx: ITxDetails) {
    const stamp = new Date(Number(tx.txDateId));
    const hours24 = stamp.getHours();
    const amPm = hours24 >= 12 ? 'Pm' : 'Am';
    const hours12 = hours24 > 12 ? hours24 - 12 : hours24;
    let minutes: string | number = stamp.getMinutes();
    if (Number(minutes) < 10) {
      minutes = `0${minutes}`;
    }
    return `${hours12}:${minutes} ${amPm}`;
  }

  function txItemTitle(tx: ITxDetails) {
    switch (tx.txType) {
      case 'stake':
        return `Stake ${tx.tokenOut.info?.symbol}/${tx.tokenIn.info?.symbol}`;
      case 'unstake':
        return `Unstake ${tx.pool?.datatoken.symbol}/${tx.pool?.baseToken.symbol}`;
      case 'approve':
        return `Unlock ${tx.tokenToUnlock || "Tokens"}`;
      default:
        return `${tx.tokenIn.info?.symbol} to ${tx.tokenOut.info?.symbol}`;
    }
  }

  return (
    <li
      key={`tx${index}`}
      className="flex flex-col mb-2 justify-center bg-gray-800 rounded-lg p-2 hover:bg-gray-900 border border-transparent hover:border-gray-600"
    >
      <div className="flex flex-row w-full justify-between">
        <div className="flex">
          <h4>{txItemTitle(txInstance)}: </h4>
          <p className={`ml-1 ${txInstance.status === 'Success' ? 'text-city-blue' : 'text-primary-400'} `}>
            {txInstance.status}
          </p>
          {txInstance.status === 'Success' || txInstance.status === 'Failure' ? null : (
            <div className="pt-.5">
              <PulseLoader size="3px" color="white" />
            </div>
          )}
        </div>
        <a href={txLink} target="_blank" rel="noreferrer" className={txLink.includes('/tx/') ? 'text-city-blue' : ''}>
          <BsBoxArrowUpRight />
        </a>
      </div>
      <div className="flex flex-row">
        <p className="text-xs text-primary-400 pr-1">{new Date(Number(txInstance.txDateId)).toDateString()} at</p>
        <p className="text-xs text-primary-400">{exactTime(txInstance)}</p>
      </div>
    </li>
  );
}
