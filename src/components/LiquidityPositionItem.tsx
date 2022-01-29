import { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import { PoolData } from "../utils/stakedPoolsUtils";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { Link } from "react-router-dom";
import { toFixed5 } from "../utils/equate";
function LiquidityPositionItem({ pool, index }: { pool: PoolData; index: number }) {
  const { address, token1, token2, shares, dtAmount, oceanAmount, yourPoolSharePerc, totalPoolShares } = pool;

  const [visible, setVisible] = useState<boolean>(false);
  const { setCurrentStakeToken, setCurrentStakePool, currentTokens, setLoading } = useContext(GlobalContext);
  function setTokenAndPool() {
    setCurrentStakePool(pool);

    try {
      if (currentTokens) {
        const currentToken = currentTokens.find((token: { pool: string }) => token.pool === address);
        setCurrentStakeToken(currentToken);
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(true);
  }

  return (
    <li id={`${token1.symbol}-lp-item`} key={`LP${index}`}>
      <div className="max-w-2xl mx-auto z-0">
        <div
          onClick={() => setVisible(!visible)}
          className={`flex justify-between p-4  ${
            visible ? "rounded-t-lg" : "rounded-lg mb-2"
          } bg-trade-darkBlue bg-opacity-75 select-none `}
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
          <div id={`${token1.symbol}-lp-info`} className={`p-4 bg-trade-darkBlue bg-opacity-75 rounded-b-lg mb-2`}>
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="grid grid-cols-2 justify-between">
                <div>
                  <p id="totalSharesTitle" className="text-type-300 text-sm">
                    Total Shares in Pool
                  </p>
                </div>
                <div className="justify-self-end">
                  <p id="totalShares" className="text-type-100 text-sm ">
                    {toFixed5(totalPoolShares)}
                  </p>
                </div>
                <div>
                  <p id="yourSharesTitle" className="text-type-300 text-sm">
                    Your Shares in Pool
                  </p>
                </div>
                <div className="justify-self-end">
                  <p id="yourShares" className="text-type-100 text-sm ">
                    {toFixed5(shares)}
                  </p>
                </div>
                <div>
                  <p id="totalPooled1Title" className="text-type-300 text-sm">
                    Total Pooled {token1.symbol}
                  </p>
                </div>
                <div id="totalPooled1" className="justify-self-end">
                  <p className="text-type-100 text-sm ">{toFixed5(dtAmount)}</p>
                </div>
                <div>
                  <p id="totalPooled2Title" className="text-type-300 text-sm">
                    Total Pooled {token2.symbol}
                  </p>
                </div>
                <div className="justify-self-end">
                  <p id="totalPooled2" className="text-type-100 text-sm ">
                    {toFixed5(oceanAmount)}
                  </p>
                </div>
                <div id="yourSharesPercTitle">
                  <p id="yourSharesPerc" className="text-type-300 text-sm">
                    Your pool share
                  </p>
                </div>
                <div className="justify-self-end">
                  <p className="text-type-100 text-sm ">
                    {Number(yourPoolSharePerc) >= 1
                      ? `${toFixed5(yourPoolSharePerc)} %`
                      : Number(yourPoolSharePerc) === 0
                      ? "0"
                      : "< 0 %"}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Link
                key="stakeX"
                to={`/stakeX?pool=${address}`}
                className="bg-primary-600 transition-colors hover:bg-primary-500 text-type-100 rounded-lg px-4 py-3 text-center"
                onClick={setTokenAndPool}
              >
                Add
              </Link>
              <Link
                id="lp-remove-link"
                key="removeStake"
                to={`/stakeX/remove?pool=${address}`}
                className={`${
                  Number(shares) === 0
                    ? "bg-primary-800 text-gray-500 border border-gray-500 pointer-events-none"
                    : "bg-primary-600 text-white hover:bg-primary-500"
                }  transition-colors rounded-lg px-4 py-3 text-center`}
                onClick={() => {
                  console.log("Exact user shares", shares);

                  if (Number(shares) > 0) setTokenAndPool();
                }}
              >
                Remove
              </Link>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </li>
  );
}

export default LiquidityPositionItem;
