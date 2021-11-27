import { MdClose } from "react-icons/md";
import TokenItem from "./TokenItem";
import { useEffect, useState, useContext } from "react";
import Loader from "./Loader"
import ReactList from "react-list";
import { GlobalContext } from "../context/GlobalState";
import { useTokenList } from "../utils/useTokenList";

const text = {
  T_SELECT_TOKEN: "Select a token",
};

const TokenModal = ({
  close,
  onClick,
  otherToken,
}: {
  close: Function;
  onClick: Function;
  otherToken?: string;
}) => {
  const { web3, chainId, currentTokens, setCurrentTokens, tokenResponse, setTokenResponse } =
  useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  
  useTokenList(chainId)


  function formatTokenList(tokenResponse: {tokens:{symbol:string}[]}, otherToken: any){
    const tokenList = tokenResponse.tokens.filter((t) => t.symbol !== otherToken)
    const oceanToken = tokenList.pop()
    tokenList.splice(0, 0, oceanToken || {symbol: "OCEAN"})
    return tokenList
  }

  useEffect(() => {
    setError(false);
    setLoading(true);
    if (currentTokens && tokenResponse.tokens) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setCurrentTokens(formatTokenList(tokenResponse, otherToken));
      setLoading(false);
      setError(false);
    } else if (tokenResponse.message && tokenResponse.message.includes("ERROR")){
      setError(true)
      setLoading(false)
    }
  }, [tokenResponse]);

  const tokenRenderer = (idx: number, key: string | number) => {
    return <TokenItem onClick={onClick} key={key} token={currentTokens[idx]} />;
  };

  const searchToken = (val: string) => {
    if (val) {
      setCurrentTokens(
        currentTokens.filter(
          (t: any) =>
            t.name.toLowerCase().indexOf(val.toLowerCase()) >= 0 ||
            t.symbol.toLowerCase().indexOf(val.toLowerCase()) >= 0
        )
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setCurrentTokens(formatTokenList(tokenResponse, otherToken));
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full sm:max-w-sm">
      <div className="p-4 bg-background border-primary-500 border rounded-lg hm-box mx-3">
        <div className="flex justify-between items-center">
          <p className="mb-0 text-type-100 text-2xl">{text.T_SELECT_TOKEN}</p>
          <MdClose
            role="button"
            onClick={() => {
              close();
            }}
            className="text-type-100 text-2xl"
          />
        </div>
        <div className="mt-4">
          <input
            onChange={(e) => searchToken(e.target.value)}
            type="text"
            placeholder="Search token"
            className="px-4 py-2 h-full w-full rounded-lg bg-primary-900 text-base outline-none focus:placeholder-type-200 placeholder-type-400"
          />
        </div>
        {loading ? (
          <div className="flex justify-center my-4">
              <Loader size = {40} />
            </div>
        ) : error ? (
          <div className="text-white text-center my-4">
            There was an error loading the tokens
          </div>
        ) : (
          <div
            className="mt-4 hm-hide-scrollbar overflow-y-scroll"
            style={{ maxHeight: "60vh" }}
          >
            <ReactList
              itemRenderer={tokenRenderer}
              length={currentTokens.length}
              type="simple"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenModal;
