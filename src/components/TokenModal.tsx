import { MdClose } from "react-icons/md";
import TokenModalItem from "./TokenModalItem";
import { useEffect, useState, useContext, useRef } from "react";
import Loader from "./Loader";
import ReactList from "react-list";
import { GlobalContext, INITIAL_TOKEN_STATE } from "../context/GlobalState";
import useTokenList, { commonTokens } from "../hooks/useTokenList";
import OutsideClickHandler from "react-outside-click-handler";
import { ITokenInfo } from "@dataxfi/datax.js";
import { TokenInfo as TInfo } from "@uniswap/token-lists";
import CommonToken from "./CommonToken";
import BigNumber from "bignumber.js";

export default function TokenModal() {
  const {
    setBlurBG,
    setShowTokenModal,
    datatokens,
    setDatatokens,
    ERC20Tokens,
    ERC20TokenResponse,
    setERC20Tokens,
    dtTokenResponse,
    location,
    chainId,
    accountId,
    selectTokenPos,
    ocean,
    setToken1,
    setToken2,
    showTokenModal,
  } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showDtks, setShowDtks] = useState<boolean>(true);
  const [commons, setCommons] = useState<TInfo[]>([]);
  useTokenList({ setLoading, setError });

  const initialChain = useRef(chainId);
  useEffect(() => {
    if (chainId !== initialChain.current) closeModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  useEffect(() => {
    if (!datatokens && accountId) {
      setLoading(true);
      setError(false);
    } else {
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dtTokenResponse, datatokens]);

  useEffect(() => {
    if (chainId && ERC20Tokens) {
      const tokens = ERC20Tokens.filter((info) => {
        const match = commonTokens[chainId].find((token) => info.address === token);
        if (match) return info;
      });
      setCommons(tokens);
    }
  }, [chainId, ERC20Tokens]);

  const tokenRenderer = (idx: number, key: string | number) => {
    if (datatokens && showDtks) return <TokenModalItem onClick={tokenSelected} key={key} token={datatokens[idx]}/>;
    if (ERC20Tokens && !showDtks) return <TokenModalItem onClick={tokenSelected} key={key} token={ERC20Tokens[idx] as ITokenInfo} />;
    return <></>;
  };

  const filterTokens = (tokenList: ITokenInfo[], val: string) => {
    return tokenList.filter((t: ITokenInfo) => t.name.toLowerCase().indexOf(val.toLowerCase()) >= 0 || t.symbol.toLowerCase().indexOf(val.toLowerCase()) >= 0);
  };

  const searchToken = (val: string) => {
    if (val && datatokens) {
      if (showDtks) {
        setDatatokens(filterTokens(datatokens, val));
      } else if (ERC20Tokens) {
        setERC20Tokens(filterTokens(ERC20Tokens as ITokenInfo[], val));
      }
    } else if (dtTokenResponse && showDtks) {
      setDatatokens(dtTokenResponse.tokens);
    } else if (ERC20TokenResponse && !showDtks) {
      setERC20Tokens(ERC20TokenResponse.tokens);
    }
  };

  function closeModal() {
    setShowTokenModal(false);
    setBlurBG(false);
  }

  const tokenSelected = async (token: ITokenInfo) => {
    if (!ocean || !accountId) return;
    const balance = new BigNumber(await ocean?.getBalance(token.address, accountId));
    let setToken;
    switch (selectTokenPos) {
      case 1:
        setToken = setToken1;
        break;
      case 2:
        setToken = setToken2;
        break;
      default:
        // import token
        // setImportPool(e.pool?.toLowerCase());
        break;
    }
    if (setToken) setToken({ ...INITIAL_TOKEN_STATE, info: token, balance });
    closeModal();
  };

  const loader = (
    <div className="w-full h-full flex items-center justify-center">
      <Loader size={40} />
    </div>
  );

  return showTokenModal ? (
    <>
      <OutsideClickHandler onOutsideClick={closeModal}>
        <div id="tokenModal" className="fixed center z-30 w-full sm:max-w-sm p-2 md:p-0">
          <div className="hm-box flex flex-col p-2 w-full h-109 bg-background border-primary-500 border rounded-lg">
            <div className="flex justify-between items-center">
              <p className="mb-0 text-gray-100 text-xl pl-2">Select a token</p>
              <MdClose id="closeTokenModalBtn" role="button" onClick={closeModal} className="text-gray-100 text-2xl" />
            </div>
            <div className="mt-2">
              <input
                id="tokenSearch"
                onChange={(e) => searchToken(e.target.value)}
                type="text"
                placeholder="Search token"
                className="px-4 py-2 h-full w-full rounded-lg bg-primary-900 text-base outline-none focus:placeholder-gray-200 placeholder-gray-400"
              />
            </div>
            {(location === "/stake" && selectTokenPos === 2) || location === "/stake/list" ? (
              <></>
            ) : (
              <div className="w-full px-2 mt-2">
                <button
                  onClick={() => setShowDtks(true)}
                  className={`mr-2 px-2 rounded  p-1 bg-white  ${showDtks ? "bg-opacity-25" : "bg-opacity-10 text-gray-500 hover:bg-opacity-20"}`}
                >
                  Datatoken
                </button>
                <button
                  id="ERC20-btn"
                  onClick={() => setShowDtks(false)}
                  className={`mr-2 px-2 rounded  p-1 bg-white ${!showDtks ? "bg-opacity-25" : "bg-opacity-10 text-gray-500 hover:bg-opacity-20"}`}
                >
                  ERC20
                </button>
              </div>
            )}
            {loading ? (
              loader
            ) : error ? (
              <div id="tokenLoadError" className="text-white text-center my-4">
                There was an error loading the tokens
              </div>
            ) : datatokens && showDtks ? (
              <div className="hm-hide-scrollbar h-full overflow-y-scroll mt-2 bg-trade-darkBlue rounded-lg border border-gray-700" id="tokenList">
                <ReactList itemRenderer={tokenRenderer} length={datatokens ? datatokens.length : 0} type="simple" />
              </div>
            ) : ERC20Tokens && !showDtks ? (
              <>
                <div className="flex flex-col mt-2">
                  <p>Common Tokens</p>
                  <hr className="py-1" />
                </div>
                <ul className="flex flex-wrap w-full">
                  {commons.map((token, index) => (
                    <CommonToken index={index} token={token} onClick={tokenSelected} />
                  ))}
                </ul>
                <div className="mt-2 hm-hide-scrollbar overflow-y-scroll bg-trade-darkBlue rounded-lg border border-gray-700" id="tokenList">
                  <ReactList itemRenderer={tokenRenderer} length={ERC20Tokens ? ERC20Tokens.length : 0} type="simple" />
                </div>
              </>
            ) : (
              loader
            )}
          </div>
        </div>
      </OutsideClickHandler>
    </>
  ) : (
    <></>
  );
}
