import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { ILiquidityPosition } from '../utils/types';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import useLiquidityPos from '../hooks/useLiquidityPos';
function LiquidityPositionItem({ singleLiqPosItem, index }: { singleLiqPosItem: ILiquidityPosition; index: number }) {
  const {
    accountId,
    address,
    token1Info,
    token2Info,
    shares,
    dtAmount,
    oceanAmount,
    yourPoolSharePerc,
    totalPoolShares,
  } = singleLiqPosItem;
  const { setSingleLiquidityPos } = useContext(GlobalContext);
  const [visible, setVisible] = useState<boolean>(false);
  const [importPool, setImportPool] = useState<string>();
  useLiquidityPos(importPool, setImportPool);

  useEffect(() => {
    setImportPool(address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  return token1Info && token2Info
    ? (
    <li id={`${token2Info.symbol}-lp-item`} key={`LP${index}`}>
      <div className="w-full mx-auto z-0">
        <div
          onClick={() => setVisible(!visible)}
          className={`flex justify-between p-2 transition-colors duration-500 ${
            visible ? 'rounded-t-lg' : 'rounded-lg mb-2'
          } ${importPool ? 'bg-city-blue bg-opacity-10' : 'modalSelectBg bg-opacity-75'}  select-none `}
          role="button"
        >
          <div className="grid grid-flow-col gap-2 items-center justify-start">
            <img
              src="https://gateway.pinata.cloud/ipfs/QmPQ13zfryc9ERuJVj7pvjCfnqJ45Km4LE5oPcFvS1SMDg/datatoken.png"
              className="rounded-lg"
              alt=""
              width="40px"
            />
            <img
              src="https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY"
              className="rounded-lg"
              alt=""
              width="40px"
            />
            <p className="text-gray-100 text-sm md:text-lg">{`${token2Info.symbol}/${token1Info.symbol}`}</p>
          </div>
          <div className="grid grid-flow-col gap-1 items-center">
            <p className="hidden lg:block text-gray-200 text-sm">Manage</p>
            {visible ? <BsChevronDown size={14} /> : <BsChevronUp size={14} />}
          </div>
        </div>
        {visible
          ? (
          <div
            id={`${token1Info.symbol}-lp-info`}
            className={`p-2 transition-colors duration-500  ${
              importPool ? 'bg-city-blue bg-opacity-10' : 'modalSelectBg bg-opacity-75'
            } rounded-b-lg mb-2`}
          >
            <div className="py-2 px-4 bg-black bg-opacity-70 rounded-lg">
              <div className="grid grid-cols-2 justify-between">
                <div>
                  <p id="totalSharesTitle" className="text-gray-300 text-sm">
                    Total Shares in Pool
                  </p>
                </div>
                <div className="justify-self-end">
                  <p id="totalShares" className="text-gray-100 text-sm ">
                    {totalPoolShares?.dp(5).toString()}
                  </p>
                </div>
                <div>
                  <p id="yourSharesTitle" className="text-gray-300 text-sm">
                    Your Shares in Pool
                  </p>
                </div>
                <div className="justify-self-end">
                  <p id="yourShares" className="text-gray-100 text-sm ">
                    {shares?.dp(5).toString()}
                  </p>
                </div>
                <div>
                  <p id="totalPooled1Title" className="text-gray-300 text-sm">
                    Total Pooled {token2Info.symbol}
                  </p>
                </div>
                <div id="totalPooled1" className="justify-self-end">
                  <p className="text-gray-100 text-sm ">{dtAmount?.dp(5).toString()}</p>
                </div>
                <div>
                  <p id="totalPooled2Title" className="text-gray-300 text-sm">
                    Total Pooled {token1Info.symbol}
                  </p>
                </div>
                <div className="justify-self-end">
                  <p id="totalPooled2" className="text-gray-100 text-sm ">
                    {oceanAmount?.dp(5).toString()}
                  </p>
                </div>
                <div id="yourSharesPercTitle">
                  <p id="yourSharesPerc" className="text-gray-300 text-sm">
                    Your pool share
                  </p>
                </div>
                <div className="justify-self-end">
                  <p className="text-gray-100 text-sm ">
                    {yourPoolSharePerc?.gte(1)
                      ? `${yourPoolSharePerc?.dp(5).toString()} %`
                      : yourPoolSharePerc?.eq(0)
                        ? '0'
                        : '< 0 %'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex mt-2">
              <Link
                id="lp-add-link"
                key="stake"
                to={`/stake?pool=${address}`}
                className="modalButton rounded p-2px w-1/2 text-center mr-1"
              >
                <div className="bg-black w-full h-full rounded p-2px">Add</div>
              </Link>
              <Link
                id="lp-remove-link"
                key="removeStake"
                to={`/stake/remove?pool=${address}`}
                className={`ml-1 ${
                  Number(shares) === 0
                    ? 'modalButton cursor-not-allowed pointer-events-none rounded p-2px w-1/2 text-center text-gray-500'
                    : 'modalButton rounded p-2px w-1/2 text-center'
                } `}
                onClick={() => {
                  console.log('Exact user shares', shares);
                  if (Number(shares) > 0) setSingleLiquidityPos(singleLiqPosItem);
                }}
              >
                <div className="bg-black w-full h-full rounded p-2px">Remove</div>
              </Link>
            </div>
          </div>
            )
          : (
          <></>
            )}
      </div>
    </li>
      )
    : (
    <></>
      );
}

export default LiquidityPositionItem;
