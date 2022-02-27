import { useState, useContext } from "react";
import TokenModal from "./TokenModal";
import { BsChevronDown, BsBoxArrowUpRight } from "react-icons/bs";
import { GlobalContext } from "../context/GlobalState";
import {ReactComponent as XLogo} from "../assets/datax-x-logo.svg"
import { IToken } from "../utils/types";
import BigNumber from 'bignumber.js'

const StakeSelect = () => {
  const { config, accountId, handleConnect, token1, setToken1, token2, setToken2 } = useContext(GlobalContext);

  const [showModal, setShowModal] = useState(false);

  const tokenSelected = (info: any) => {
    setToken1({...token1, value: new BigNumber(0)})
    setToken2({...token2, info});
    setShowModal(false); 
  };

  function showTokenModal() {
    if (accountId) {
      setShowModal(true);
    } else {
      if(handleConnect)handleConnect();
    }
  }

  
  return (
    <div>
      <div className="mt-2 modalSelectBg p-2 rounded-lg">
        <div className="md:grid md:grid-cols-5">
          <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center">
            {token2?.info ? (
              <img src={token2.info.logoURI} className="w-10 h-10 rounded-md" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-md bg-background flex justify-center items-center text-3xl">
              <XLogo style={{height: "30px"}} />
            </div>
            )}
            <div
              id="stakeSelectBtn"
              role="button"
              tabIndex={0}
              onClick={() => {
                showTokenModal();
              }}
            >
              {token2?.info ? (
                <div>
                  <p className="text-type-100 text-xs">DataToken</p>
                  <span className="text-type-200 font-bold grid grid-flow-col items-center gap-1">
                    <span id="stakeToken" className="text-xs sm:text-lg">{token2.info.symbol}</span>
                    <BsChevronDown className="text-type-200" size="16" />
                  </span>
                </div>
              ) : (
                <p className="text-xs text-type-100 border-type-300 border rounded-full px-2 py-1 mt-1 hover:bg-gray-400">Select token</p>
              )}
            </div>
          </div>
          <div className="col-span-3 ml-4 mt-3 md:mt-0">
            {token2?.info ? (
              <div>
                <p className="text-type-100 uppercase text-xs md:text-base">{token2.info.name}</p>
                <div className="grid grid-flow-col justify-start gap-4 text-sm">
                  <a
                    id="stakePoolLink"
                    href={config?.default.explorerUri + "/address/" + token2.info.pool}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white grid grid-flow-col items-center gap-2 justify-start border-b border-type-300"
                  >
                    Pool <BsBoxArrowUpRight />{" "}
                  </a>
                  <a
                    id="stakeTokenLink"
                    href={config?.default.explorerUri + "/address/" + token2.info.address}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white grid grid-flow-col items-center gap-2 justify-start border-b border-type-300"
                  >
                    Token <BsBoxArrowUpRight />{" "}
                  </a>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
        {showModal ? (
          <TokenModal onClick={tokenSelected} close={() => setShowModal(false)} otherToken="OCEAN" />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default StakeSelect;
