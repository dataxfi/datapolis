import { MdClose } from "react-icons/md";
import TokenItem from "./TokenItem";
import { useEffect, useState, useContext, useRef } from "react";
import Loader from "./Loader";
import ReactList from "react-list";
import { GlobalContext } from "../context/GlobalState";
import useTokenList, { formatTokenArray } from "../hooks/useTokenList";

const text = {
  T_SELECT_TOKEN: "Select a token",
};

const TokenModal = ({ close, onClick, otherToken }: { close: Function; onClick: Function; otherToken: string }) => {
  const { tokenModalArray, setTokenModalArray, tokenResponse, location, chainId } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useTokenList(otherToken, setLoading);

  const intialChain = useRef(chainId);
  useEffect(() => {
    if (chainId !== intialChain.current) close();
  }, [chainId]);

  useEffect(() => {
    if (!tokenResponse) {
      setLoading(true);
      setError(false);
      if (tokenResponse && tokenResponse.tokens) {
        const formattedList = formatTokenArray(tokenResponse, otherToken, location);
        setTokenModalArray(formattedList);
        setLoading(false);
        setError(false);
      } else if (tokenResponse === null) {
        setError(true);
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenResponse]);

  const tokenRenderer = (idx: number, key: string | number) => {
    return <TokenItem onClick={onClick} key={key} token={tokenModalArray[idx]} />;
  };

  const searchToken = (val: string) => {
    if (val) {
      setTokenModalArray(
        tokenModalArray.filter(
          (t: any) =>
            t.name.toLowerCase().indexOf(val.toLowerCase()) >= 0 ||
            t.symbol.toLowerCase().indexOf(val.toLowerCase()) >= 0
        )
      );
    } else {
      setTokenModalArray(formatTokenArray(tokenResponse, otherToken, location));
    }
  };

  return (
    <div
      id="tokenModal"
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full sm:max-w-xs"
    >
      <div className="p-2 bg-background border-primary-500 border rounded-lg hm-box mx-3">
        <div className="flex justify-between items-center">
          <p className="mb-0 text-type-100 text-2xl pl-2">{text.T_SELECT_TOKEN}</p>
          <MdClose
            id="closeTokenModalBtn"
            role="button"
            onClick={() => {
              close();
            }}
            className="text-type-100 text-2xl"
          />
        </div>
        <div className="mt-4">
          <input
            id="tokenSearch"
            onChange={(e) => searchToken(e.target.value)}
            type="text"
            placeholder="Search token"
            className="px-4 py-2 h-full w-full rounded-lg bg-primary-900 text-base outline-none focus:placeholder-type-200 placeholder-type-400"
          />
        </div>
        {loading ? (
          <div id="tokenLoadingAni" className="flex justify-center my-4">
            <Loader size={40} />
          </div>
        ) : error ? (
          <div id="tokenLoadError" className="text-white text-center my-4">
            There was an error loading the tokens
          </div>
        ) : (
          <div className="mt-4 hm-hide-scrollbar overflow-y-scroll" style={{ maxHeight: "60vh" }} id="tokenList">
            <ReactList itemRenderer={tokenRenderer} length={tokenModalArray ? tokenModalArray.length : 0} type="simple" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenModal;
