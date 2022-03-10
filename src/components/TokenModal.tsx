import { MdClose } from "react-icons/md";
import TokenModalItem from "./TokenModalItem";
import { useEffect, useState, useContext, useRef } from "react";
import Loader from "./Loader";
import ReactList from "react-list";
import { GlobalContext } from "../context/GlobalState";
import useTokenList, { formatTokenArray } from "../hooks/useTokenList";
import OutsideClickHandler from "react-outside-click-handler";
import { ITokenInfo } from "@dataxfi/datax.js";

export default function TokenModal({
  close,
  onClick,
  otherToken,
  pos,
}: {
  close: Function;
  onClick: Function;
  otherToken: string;
  pos?: 1 | 2;
}) {
  const {
    datatokens,
    setDatatokens,
    ERC20Tokens,
    ERC20TokenResponse,
    setERC20Tokens,
    dtTokenResponse,
    location,
    chainId,
    accountId,
  } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showDtks, setShowDtks] = useState<boolean>(true);
  const [showDescModal, setShowDescModal] = useState<boolean>(false);
  const [commons, setCommons] = useState<ITokenInfo[]>([
    {
      pool: "adfa",
      address: "0x006BeA43Baa3f7A6f765F14f10A1a1b08334EF45",
      chainId: 1,
      name: "Stox",
      symbol: "STX",
      decimals: 18,
      logoURI: "https://tokens.1inch.io/0x006bea43baa3f7a6f765f14f10a1a1b08334ef45.png",
    },
    {
      pool: "adfa",
      address: "0x006BeA43Baa3f7A6f765F14f10A1a1b08334EF45",
      chainId: 1,
      name: "Stox",
      symbol: "STX",
      decimals: 18,
      logoURI: "https://tokens.1inch.io/0x006bea43baa3f7a6f765f14f10a1a1b08334ef45.png",
    },
    {
      pool: "adfa",
      address: "0x006BeA43Baa3f7A6f765F14f10A1a1b08334EF45",
      chainId: 1,
      name: "Stox",
      symbol: "STX",
      decimals: 18,
      logoURI: "https://tokens.1inch.io/0x006bea43baa3f7a6f765f14f10a1a1b08334ef45.png",
    },
    {
      pool: "adfa",
      address: "0x006BeA43Baa3f7A6f765F14f10A1a1b08334EF45",
      chainId: 1,
      name: "Stox",
      symbol: "STX",
      decimals: 18,
      logoURI: "https://tokens.1inch.io/0x006bea43baa3f7a6f765f14f10a1a1b08334ef45.png",
    },
    {
      pool: "adfa",
      address: "0x006BeA43Baa3f7A6f765F14f10A1a1b08334EF45",
      chainId: 1,
      name: "Stox",
      symbol: "STX",
      decimals: 18,
      logoURI: "https://tokens.1inch.io/0x006bea43baa3f7a6f765f14f10a1a1b08334ef45.png",
    },
    {
      pool: "adfa",
      address: "0x006BeA43Baa3f7A6f765F14f10A1a1b08334EF45",
      chainId: 1,
      name: "Stox",
      symbol: "STX",
      decimals: 18,
      logoURI: "https://tokens.1inch.io/0x006bea43baa3f7a6f765f14f10a1a1b08334ef45.png",
    },
  ]);
  useTokenList({ otherToken, setLoading, setError });

  useEffect(() => {
    if (!showDtks) {
      setShowDescModal(false);
    }
  }, [showDtks]);

  const initialChain = useRef(chainId);
  useEffect(() => {
    if (chainId !== initialChain.current) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  useEffect(() => {
    if (!datatokens && accountId) {
      setLoading(true);
      setError(false);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dtTokenResponse, datatokens]);

  const tokenRenderer = (idx: number, key: string | number) => {
    if (datatokens && showDtks)
      return (
        <TokenModalItem setShow={setShowDescModal} dtks={true} onClick={onClick} key={key} token={datatokens[idx]} />
      );
    if (ERC20Tokens && !showDtks) return <TokenModalItem onClick={onClick} key={key} token={ERC20Tokens[idx]} />;
    return <></>;
  };

  const filterTokens = (tokenList: ITokenInfo[], val: string) => {
    return tokenList.filter(
      (t: ITokenInfo) =>
        t.name.toLowerCase().indexOf(val.toLowerCase()) >= 0 || t.symbol.toLowerCase().indexOf(val.toLowerCase()) >= 0
    );
  };

  const searchToken = (val: string) => {
    if (val && datatokens) {
      if (showDtks) {
        setDatatokens(filterTokens(datatokens, val));
      } else if (ERC20Tokens) {
        setERC20Tokens(filterTokens(ERC20Tokens, val));
      }
    } else if (dtTokenResponse && showDtks) {
      setDatatokens(formatTokenArray(dtTokenResponse, otherToken, location));
    } else if (ERC20TokenResponse && !showDtks) {
      setERC20Tokens(ERC20TokenResponse.tokens);
    }
  };

  const loader = (
    <div id="tokenLoadingAni" className="flex justify-center my-4">
      <Loader size={40} />
    </div>
  );

  return (
    <>
      <div
        id="tokenModal"
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-full sm:max-w-sm"
      >
        <div className="relative">
          <OutsideClickHandler
            onOutsideClick={() => {
              close();
            }}
          >
            <div className="p-2 bg-background border-primary-500 border rounded-lg hm-box mx-3 max-h-109 overflow-hidden">
              <div className="flex justify-between items-center">
                <p className="mb-0 text-gray-100 text-xl pl-2">Select a token</p>
                <MdClose
                  id="closeTokenModalBtn"
                  role="button"
                  onClick={() => {
                    close();
                  }}
                  className="text-gray-100 text-2xl"
                />
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
              {(location === "/stake" && pos === 2) || location === "/stake/list" ? (
                <></>
              ) : (
                <div className="w-full px-2 mt-2">
                  <button
                    onClick={() => setShowDtks(true)}
                    className={`mr-2 px-2 rounded  p-1 bg-white  ${
                      showDtks ? "bg-opacity-25" : "bg-opacity-10 text-gray-500 hover:bg-opacity-20"
                    }`}
                  >
                    Datatoken
                  </button>
                  <button
                    onClick={() => setShowDtks(false)}
                    className={`mr-2 px-2 rounded  p-1 bg-white ${
                      !showDtks ? "bg-opacity-25" : "bg-opacity-10 text-gray-500 hover:bg-opacity-20"
                    }`}
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
                <div className="mt-4 hm-hide-scrollbar overflow-y-scroll" style={{ maxHeight: "60vh" }} id="tokenList">
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
                      <li
                        key={`common${index}`}
                        className="rounded mx-1 my-1 py-2px bg-city-blue bg-opacity-25 hover:bg-opacity-40"
                      >
                        <button
                          className="flex  px-2 items-center"
                          onClick={() => {
                            onClick(token);
                          }}
                        >
                          <img src={token.logoURI} className="rounded-lg w-5 h-5 mr-1" alt="" loading="lazy" />
                          <p>{token.symbol}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div
                    className="mt-4 hm-hide-scrollbar overflow-y-scroll"
                    style={{ maxHeight: "60vh" }}
                    id="tokenList"
                  >
                    <ReactList
                      itemRenderer={tokenRenderer}
                      length={ERC20Tokens ? ERC20Tokens.length : 0}
                      type="simple"
                    />
                  </div>
                </>
              ) : (
                loader
              )}
            </div>
          </OutsideClickHandler>
        </div>
      </div>
    </>
  );
}
