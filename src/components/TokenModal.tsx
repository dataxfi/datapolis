import { MdClose } from 'react-icons/md';
import TokenModalItem from './TokenModalItem';
import { useEffect, useState, useContext, useRef, SetStateAction } from 'react';
import Loader from './Loader';
import ReactList from 'react-list';
import { GlobalContext, INITIAL_TOKEN_STATE } from '../context/GlobalState';
import useTokenList, { commonTokens } from '../hooks/useTokenList';
import { IToken, ITokenInfo } from '@dataxfi/datax.js';
import { TokenInfo as TInfo } from '@uniswap/token-lists';
import CommonToken from './CommonToken';
import BigNumber from 'bignumber.js';
import CenterModal from './CenterModal';

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
    setTokenIn,
    setTokenOut,
    showTokenModal,
    setImportPool,
    trade,
  } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showDtks, setShowDtks] = useState<boolean>(true);
  const [commons, setCommons] = useState<TInfo[]>([]);
  const [controller, setController] = useState(new AbortController());
  useTokenList({ setLoading, setError });
  const initialChain = useRef(chainId);
  useEffect(() => {
    if (chainId !== initialChain.current) {
      console.log('closing due to chain');
      closeModal();
      initialChain.current = chainId;
    }
  }, [chainId]);

  useEffect(() => {
    if (!showTokenModal) return;
    if (location === '/stake/remove') setShowDtks(false);
    if (location === '/stake' && selectTokenPos.current === 1) setShowDtks(false);
  }, [showTokenModal, selectTokenPos, location]);

  useEffect(() => {
    if (!datatokens && accountId) {
      setLoading(true);
      setError(false);
    }
    // else {
    //   console.log("Closing here")
    //   closeModal();
    // }
  }, [dtTokenResponse, datatokens]);

  useEffect(() => {
    try {
      if (chainId && ERC20Tokens) {
        const tokens = ERC20Tokens.filter((info) => {
          const match = commonTokens[chainId].find((token) => info.address === token);
          if (match) return info;
          else return null;
        });
        setCommons(tokens);
      }
    } catch (error) {
      // console.error(error)
    }
  }, [chainId, ERC20Tokens]);

  const tokenRenderer = (idx: number, key: string | number) => {
    if (datatokens && showDtks) return <TokenModalItem onClick={tokenSelected} key={key} token={datatokens[idx]} />;
    if (ERC20Tokens && !showDtks) {
      return <TokenModalItem onClick={tokenSelected} key={key} token={ERC20Tokens[idx] as ITokenInfo} />;
    }
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
        setERC20Tokens(filterTokens(ERC20Tokens as ITokenInfo[], val));
      }
    } else if (dtTokenResponse && showDtks) {
      setDatatokens(dtTokenResponse.tokens);
    } else if (ERC20TokenResponse && !showDtks) {
      setERC20Tokens(ERC20TokenResponse.tokens);
    }
  };

  function closeModal() {
    console.log('Closing token modal');
    setShowTokenModal(false);
    setBlurBG(false);
    setShowDtks(true);
  }

  const tokenSelected = async (token: ITokenInfo) => {
    controller.abort();
    const newController = new AbortController();
    const signal = newController.signal;
    if (!trade || !accountId) return;

    return new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => {
        return reject(new Error('New token selected.'));
      });

      closeModal();
      let setToken: React.Dispatch<SetStateAction<IToken>> = setTokenIn;
      console.log(token, selectTokenPos.current);
      switch (selectTokenPos.current) {
        case 1:
          setToken = setTokenIn;
          break;
        case 2:
          setToken = setTokenOut;
          break;
        default:
          console.log('setting pool to import', token.pools[0].id);
          setImportPool(token.pools[0].id);
          break;
      }
      if (setToken) setToken({ ...INITIAL_TOKEN_STATE, info: token });
      trade.getBalance(token.address, accountId).then((balance) => {
        console.log('got balance: ', balance);

        if (setToken) setToken({ ...INITIAL_TOKEN_STATE, info: token, balance: new BigNumber(balance) });
      });
      resolve(setController(newController));
    });
  };

  const loader = (
    <div className="w-full h-full flex items-center justify-center">
      <Loader size={40} />
    </div>
  );

  return showTokenModal ? (
    <>
      <CenterModal className="z-30 w-full sm:max-w-sm p-2 md:p-0" onOutsideClick={closeModal} id="tokenModal">
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
          {(location === '/stake' && selectTokenPos.current === 2) ||
          location === '/stake/list' ||
          location !== '/trade' ? (
            <></>
          ) : (
            <div className="w-full px-2 mt-2">
              <button
                onClick={() => setShowDtks(true)}
                className={`mr-2 px-2 rounded  p-1 bg-white  ${
                  showDtks ? 'bg-opacity-25' : 'bg-opacity-10 text-gray-500 hover:bg-opacity-20'
                }`}
              >
                Datatoken
              </button>
              <button
                id="ERC20-btn"
                onClick={() => setShowDtks(false)}
                className={`mr-2 px-2 rounded  p-1 bg-white ${
                  !showDtks ? 'bg-opacity-25' : 'bg-opacity-10 text-gray-500 hover:bg-opacity-20'
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
              An error occurred while trying to loading the token list.
            </div>
          ) : datatokens && showDtks ? (
            <div
              className="hm-hide-scrollbar h-full overflow-y-scroll mt-2 bg-trade-darkBlue rounded-lg border border-gray-700 p-1"
              id="tokenList"
            >
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
                  <CommonToken index={index} token={token as ITokenInfo} onClick={tokenSelected} key={index} />
                ))}
              </ul>
              <div
                className="mt-2 hm-hide-scrollbar h-full overflow-y-scroll bg-trade-darkBlue rounded-lg border border-gray-700 p-1"
                id="tokenList"
              >
                <ReactList itemRenderer={tokenRenderer} length={ERC20Tokens ? ERC20Tokens.length : 0} type="simple" />
              </div>
            </>
          ) : (
            loader
          )}
        </div>
      </CenterModal>
    </>
  ) : (
    <></>
  );
}
