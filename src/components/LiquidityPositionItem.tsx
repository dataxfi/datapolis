import React, { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import { PoolData } from "../utils/stakedPoolsUtils";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { Link } from "react-router-dom";
import { toFixed5 } from "../utils/equate";
function LiquidityPositionItem({
  pool,
  index,
  length,
}: {
  pool: PoolData;
  index: number;
  length: number;
}) {
  const {
    address,
    token1,
    token2,
    shares,
    dtAmount,
    oceanAmount,
    yourPoolSharePerc,
    totalPoolShares,
  } = pool;

  const [visible, setVisible] = useState<boolean>(false);
  const {
    setCurrentStakeToken,
    setCurrentStakePool,
    currentTokens,
    setLoading,
  } = useContext(GlobalContext);
  function setTokenAndPool() {
    setCurrentStakePool(pool);

    try {
      if (currentTokens) {
        const currentToken = currentTokens.find(
          (token: { pool: string }) => token.pool === address
        );
        setCurrentStakeToken(currentToken);
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(true);
  }

  return (
    <li key={`LP${index}`}>
      <div className="max-w-2xl mx-auto z-0">
        <div
          onClick={() => setVisible(!visible)}
          className={`flex justify-between p-4  ${
            visible ? "rounded-t-lg" : "rounded-lg mb-2"
          } bg-primary-900 select-none `}
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
            <p className="text-type-100 text-sm md:text-lg">{`${token1.symbol}/${token2.symbol}`}</p>
          </div>
          <div className="grid grid-flow-col gap-1 items-center">
            <p className="text-type-200 text-sm">Manage</p>
            {visible ? <BsChevronDown size={14} /> : <BsChevronUp size={14} />}
          </div>
        </div>
        {visible ? (
          <div className={`p-4 bg-primary-900 rounded-b-lg mb-2`}>
            <div className="p-4 bg-primary-800 rounded-lg">
              <div className="grid grid-cols-2 justify-between">
                <div>
                  <p className="text-type-300 text-sm">Total Shares in Pool</p>
                </div>
                <div className="justify-self-end">
                  <p className="text-type-100 text-sm ">
                    {toFixed5(totalPoolShares)}
                  </p>
                </div>
                <div>
                  <p className="text-type-300 text-sm">Your Shares in Pool</p>
                </div>
                <div className="justify-self-end">
                  <p className="text-type-100 text-sm ">{toFixed5(shares)}</p>
                </div>
                <div>
                  <p className="text-type-300 text-sm">
                    Total Pooled {token1.symbol}
                  </p>
                </div>
                <div className="justify-self-end">
                  <p className="text-type-100 text-sm ">{toFixed5(dtAmount)}</p>
                </div>
                <div>
                  <p className="text-type-300 text-sm">
                    Total Pooled {token2.symbol}
                  </p>
                </div>
                <div className="justify-self-end">
                  <p className="text-type-100 text-sm ">
                    {toFixed5(oceanAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-type-300 text-sm">Your pool share</p>
                </div>
                <div className="justify-self-end">
                  <p className="text-type-100 text-sm ">
                    {Number(yourPoolSharePerc) >= 1
                      ? `${toFixed5(yourPoolSharePerc)} %`
                      : "< 0 %"}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Link
                to={`/stakeX?pool=${address}`}
                className="bg-primary-600 transition-colors hover:bg-primary-500 text-type-100 rounded-lg px-4 py-3 text-center"
                onClick={setTokenAndPool}
              >
                Add
              </Link>
              <Link
                to={`/stakeX/remove?pool=${address}`}
                className="bg-primary-600 transition-colors hover:bg-primary-500 text-type-100 rounded-lg px-4 py-3 text-center"
                onClick={setTokenAndPool}
              >
                Remove
              </Link>
            </div>
          </div>
        ) : (
          null
        )}
      </div>
    </li>
  );
}

export default LiquidityPositionItem;
