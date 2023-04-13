import { createContext, PropsWithChildren, useEffect, useRef, useState } from 'react';
import Web3 from 'web3';
import { Config, Watcher, IToken, ITList, ITokenInfo, Stake, Trade } from '@dataxfi/datax.js';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { disclaimer } from '../components/DisclaimerModal';


import {
  connectedMultipleWalletsGA,
  connectedWalletGA,
  connectedToNetworkGA,
  deniedSignatureGA,
  connectedWalletViaGA,
} from './Analytics';
import {
  IDisclaimerSigned,
  globalStates,
  ILiquidityPosition,
  ITxHistory,
  ITxDetails,
  ISnackbarItem,
  supportedChains,
  ApprovalStates,
  IPathData,
} from '../@types/types';
import BigNumber from 'bignumber.js';
import { bn } from '../utils/utils';

const CONNECT_TEXT = 'Connect Wallet';
export const INITIAL_TOKEN_STATE: IToken = {
  info: null,
  value: new BigNumber(0),
  balance: new BigNumber(0),
  percentage: new BigNumber(0),
  loading: false,
};

export function placeHolderOrContent(
  content: JSX.Element,
  placeholderSize: string,
  conditional: boolean,
  rows: number = 1
) {
  if (conditional) return content;
  const elements = [];
  while (rows) {
    elements.push(
      <div
        key={`placholder-${rows}`}
        style={{
          width: placeholderSize,
          height: '12px',
          borderRadius: '4px',
          backgroundColor: '#1b1b1b',
          margin: '4px 0',
        }}
      />
    );
    rows = rows - 1;
  }
  return elements.map((e) => e);
}

export const GlobalContext = createContext<globalStates>({} as globalStates);

export const GlobalProvider = ({ children }: { children: PropsWithChildren<{}> }) => {
  // essential states for connection to web3, user wallet, ocean operations, and DataX configurations
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>();
  const [accountId, setAccountId] = useState<string>();
  const [chainId, setChainId] = useState<supportedChains>();
  const [provider, setProvider] = useState<Web3Modal>();
  const [web3, setWeb3] = useState<Web3>();
  const [config, setConfig] = useState<Config>();
  const [watcher, setWatcher] = useState<Watcher>();
  const [stake, setStake] = useState<Stake>();
  const [refAddress, setRefAddress] = useState<string>();
  const [trade, setTrade] = useState<Trade>();

  // loading state is to be used when the app needs to finish loading before a page can render (i.e. show loading screen)
  const [loading, setLoading] = useState<boolean>(true);
  const [location, setLocation] = useState<string>('/');

  // Modal and notification states
  const [unsupportedNet, setUnsupportedNet] = useState<boolean>(false);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [snackbarItem, setSnackbarItem] = useState<ISnackbarItem>();
  const [showUnlockTokenModal, setShowUnlockTokenModal] = useState<boolean>(false);
  const [showTokenModal, setShowTokenModal] = useState<boolean>(false);
  const [showTxHistoryModal, setShowTxHistoryModal] = useState<boolean>(false);
  const [showDescModal, setShowDescModal] = useState<boolean>(false);
  const [confirmingTx, setConfirmingTx] = useState(false);
  const [showConfirmTxDetails, setShowConfirmTxDetails] = useState(false);
  const [showTxDone, setShowTxDone] = useState(false);
  const [cookiesAllowed, setCookiesAllowed] = useState<boolean | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);
  const [disclaimerSigned, setDisclaimerSigned] = useState<IDisclaimerSigned>({
    client: null,
    wallet: null,
  });

  // transaction states
  const [spotSwapFee, setSpotSwapFee] = useState<string | undefined>('0');
  const baseMinExchange = '0.01';
  const [pendingTxs, setPendingTxs] = useState<string[]>([]);
  const [txHistory, setTxHistory] = useState<ITxHistory>();
  const [lastTx, setLastTx] = useState<ITxDetails>();
  const [preTxDetails, setPreTxDetails] = useState<ITxDetails>();
  const [executeSwap, setExecuteSwap] = useState<boolean>(false);
  const [txApproved, setTxApproved] = useState<boolean>(false);
  const [showTxSettings, setShowTxSettings] = useState<boolean>(false);
  const [executeStake, setExecuteStake] = useState<boolean>(false);
  const [executeUnstake, setExecuteUnstake] = useState<boolean>(false);
  const [executeUnlock, setExecuteUnlock] = useState<boolean>(false);
  const [approving, setApproving] = useState<ApprovalStates>('pending');
  const [swapFee, setSwapFee] = useState<string>('0');
  const [afterSlippage, setAfterSlippage] = useState<BigNumber>(bn(0));
  const [slippage, setSlippage] = useState<BigNumber>(new BigNumber(1));
  const [paths, setPaths] = useState<IPathData | null>(null);
  const [path, setPath] = useState<string[]>();
  const [meta, setMeta] = useState<string[]>();

  // user pool information states
  const [allStakedPools, setAllStakedPools] = useState<ILiquidityPosition[]>();
  const [singleLiquidityPos, setSingleLiquidityPos] = useState<ILiquidityPosition>();

  // token data states
  const [datatokens, setDatatokens] = useState<ITokenInfo[]>();
  const [ERC20Tokens, setERC20Tokens] = useState<ITokenInfo[]>();
  const [ERC20TokenResponse, setERC20TokenResponse] = useState<ITList>();
  const [dtTokenResponse, setDtTokenResponse] = useState<ITList>();
  const [t2DIDResponse, setT2DIDResponse] = useState<any>();
  const [buttonText, setButtonText] = useState<string>(CONNECT_TEXT);
  const [exactToken, setExactToken] = useState<1 | 2>(1);
  const [balanceTokenIn, setBalanceTokenIn] = useState<BigNumber>(bn(0));
  const [balanceTokenOut, setBalanceTokenOut] = useState<BigNumber>(bn(0));
  const [unstakeAllowance, setUnstakeAllowance] = useState<BigNumber>(bn(0));

  // selected token states
  const [tokenIn, setTokenIn] = useState<IToken>(INITIAL_TOKEN_STATE);
  const [tokenOut, setTokenOut] = useState<IToken>(INITIAL_TOKEN_STATE);
  const selectTokenPos = useRef<1 | 2 | null>(null);
  const [importPool, setImportPool] = useState<string>();
  // bg states
  const [bgOff, setBgOff] = useState(false);
  const [blurBG, setBlurBG] = useState(false);

  const tokensCleared = useRef(false);

  // remove all pending signatures to instantiate disclaimer flow upon user reconnection
  useEffect(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key || '');
      if (value === 'Pending') localStorage.removeItem(key || '');
      localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
    }

    const bgPref = localStorage.getItem('bgPref');
    if (bgPref) setBgOff(JSON.parse(bgPref));
  }, []);

  // intitialize web3modal to use to connect to provider
  useEffect(() => {
    async function init() {
      try {
        const web3Modal = new Web3Modal({
          cacheProvider: true,
          network: 'mainnet', // optional
          theme: {
            background: 'rgb(0, 0, 0, 1)',
            main: 'rgb(199, 199, 199)',
            secondary: 'rgb(136, 136, 136)',
            border: 'rgba(45, 45, 45, 1)',
            hover: 'rgba(58, 123, 191, .3)',
          },
          providerOptions: {
            walletconnect: {
              package: WalletConnectProvider, // required
              options: {
                infuraId: process.env.REACT_APP_INFURA_ID, // required
                rpc: { 137: 'https://matic-mainnet.chainstacklabs.com' },
              },
            },
          }, // required
        });
        setWeb3Modal(web3Modal);
      } catch (error) {
        console.log(error);
      }
    }

    init();
  }, [web3, chainId]);

  /**
   *
   * Handles wallet side disclaimer signature.
   *
   * @param account
   * @param web3
   * @returns
   * signature hash from wallet
   */
  async function handleSignature(account: string, web3: Web3, bypass?: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
      account = account.toLowerCase();
      const localSignature = localStorage.getItem(account || '');
      const clientApproved = disclaimerSigned.client;
      const walletApproved = disclaimerSigned.wallet;
      if (localSignature) return resolve(localSignature);
      if ((clientApproved || bypass) && !walletApproved) {
        localStorage.setItem(account, 'pending');
        web3.eth.personal
          .sign(disclaimer, account || '', '')
          .then((signature) => {
            localStorage.setItem(account, signature);
            setDisclaimerSigned({ ...disclaimerSigned, wallet: true });
            // if bypass is true then this is being called from Disclaimer modal
            if (bypass) handleConnect();
            resolve(signature);
          })
          .catch((error) => {
            console.error(error);
            setSnackbarItem({ type: 'error', message: 'User Denied Disclaimer' });
            localStorage.removeItem(account);
            setDisclaimerSigned({ client: false, wallet: false });
            deniedSignatureGA();
            reject(error);
          })
          .finally(() => {
            setShowDisclaimer(false);
            setBlurBG(false);
          });
     // } catch (error) {
      } else if (!clientApproved && !walletApproved) {
        setShowDisclaimer(true);
        setBlurBG(true);
      }
    });
  }

  /**
   *
   * Handles client side disclaimer approval.
   *
   * @param account
   * @param web3
   * @param localSignature
   * @returns
   * current localSignature value
   */

  /**
   * Handles connection to web3 and user wallet.
   */
  async function handleConnect() {
    try {
      const provider = await web3Modal?.connect();
      setProvider(provider);
      const web3 = new Web3(provider);
      setWeb3(web3);

      const accounts = await web3.eth.getAccounts();
      const account = accounts[0] ? accounts[0].toLowerCase() : null;
      if (!account) return;
      await handleSignature(account, web3);

      const _chainId = String(await web3.eth.getChainId());
      setChainId(_chainId as supportedChains);

      const network: supportedChains = String(_chainId) as supportedChains;

      const config = new Config(web3, network);
      setConfig(config);

      const watcher = new Watcher(web3, network);
      setWatcher(watcher);

      const stake = new Stake(web3, network);
      setStake(stake);

      const trade = new Trade(web3, network);
      setTrade(trade);

      isSupportedChain(config, String(_chainId), accounts[0] ? accounts[0] : '');

      const refAddress = process.env.REACT_APP_REF_ADDRESS;
      const refFee = process.env.REACT_APP_REF_FEE;
      console.log('Ref Address: ', refAddress);
      console.log('Ref Fee: ', refFee);
      setRefAddress(refAddress);
      setSpotSwapFee(refFee);
      setListeners(provider, web3);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Verifies the current chain is supported by DataX before connecting.
   *
   * @param config
   * @param chainId
   * @param account
   * @returns
   */

  function isSupportedChain(config: Config, chainId: string, account?: string) {
    try {
      const network = config.getNetwork(chainId as supportedChains);
      // connectedToNetworkGA({ network, chainId });
      if (network === 'unknown') {
        setAccountId(undefined);
        setButtonText(CONNECT_TEXT);
        setUnsupportedNet(true);
      } else {
        setUnsupportedNet(false);
        setAccountId(account);
        setButtonText(account || CONNECT_TEXT);
        connectedWalletGA();
        const wallet = localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER') || 'unknown';
         connectedWalletViaGA({ wallet });
        return true;
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Sets listeners events on: accountId, chainId, provider connection, provider disconnection.
   *
   * @param provider
   * @param web3
   */

  function setListeners(provider: any, web3: Web3) {
    provider.on('accountsChanged', async (accounts: string[]) => {
      const account = accounts[0] ? accounts[0].toLowerCase() : null;
      const localSignature = localStorage.getItem(account || '');
      if (localSignature && localSignature !== 'pending') {
        setAccountId(accounts[0]);
        setButtonText(accounts.length && accounts[0] !== '' ? accounts[0] : CONNECT_TEXT);
        setDisclaimerSigned({ client: true, wallet: true });
        setShowDisclaimer(false);
        setBlurBG(false);
        // connectedMultipleWalletsGA();
        // connectedWalletGA();
      } else {
        setAccountId(undefined);
        setButtonText(CONNECT_TEXT);
        setChainId(undefined);
        setDisclaimerSigned({ client: false, wallet: false });
      }
      setAllStakedPools(undefined);
    });

    // Subscribe to chainId change
    provider.on('chainChanged', async (chainId: supportedChains) => {
      // token reset
      setTokenIn(INITIAL_TOKEN_STATE);
      setTokenOut(INITIAL_TOKEN_STATE);
      setShowDescModal(false);

      //token list reset
      setDatatokens(undefined);
      setDtTokenResponse(undefined);
      setERC20TokenResponse(undefined);
      setERC20Tokens(undefined);

      //tx and lp info reset
      setTxHistory(undefined);
      setPendingTxs([]);
      setAllStakedPools(undefined);
      const parsedId: supportedChains = String(parseInt(chainId)) as supportedChains;
      // console.log("Chain changed to ", parsedId);
      setChainId(parsedId as supportedChains);
      const config = new Config(web3, parsedId);
      // console.log("Config for new chain:");
      setConfig(config);
      isSupportedChain(config, parsedId, undefined);
    });

    // Subscribe to provider connection
    provider.on('connect', (info: { chainId: number }) => {
      console.info('Connect event fired');
      console.info(info);
    });

    // Subscribe to provider disconnection
    provider.on('disconnect', (error: { code: number; message: string }) => {
      console.error(error);
    });
  }

  return (
    <GlobalContext.Provider
      value={{
        handleConnect,
        buttonText,
        accountId,
        chainId,
        provider,
        web3,
        config,
        unsupportedNet,
        tokensCleared,
        refAddress,
        stake,
        trade,
        paths,
        setPaths,
        spotSwapFee,
        path,
        setPath,
        baseMinExchange,
        handleSignature,
        cookiesAllowed,
        setCookiesAllowed,
        showDisclaimer,
        setShowDisclaimer,
        disclaimerSigned,
        setDisclaimerSigned,
        loading,
        setLoading,
        allStakedPools,
        setAllStakedPools,
        datatokens,
        setDatatokens,
        ERC20Tokens,
        setERC20Tokens,
        ERC20TokenResponse,
        setERC20TokenResponse,
        dtTokenResponse,
        setDtTokenResponse,
        singleLiquidityPos,
        setSingleLiquidityPos,
        txHistory,
        setTxHistory,
        lastTx,
        setLastTx,
        showSnackbar,
        setShowSnackbar,
        pendingTxs,
        setPendingTxs,
        showTxHistoryModal,
        setShowTxHistoryModal,
        watcher,
        setWatcher,
        confirmingTx,
        setConfirmingTx,
        showTxDone,
        setShowTxDone,
        showUnlockTokenModal,
        setShowUnlockTokenModal,
        location,
        setLocation,
        bgOff,
        setBgOff,
        tokenIn,
        setTokenIn,
        tokenOut,
        setTokenOut,
        snackbarItem,
        setSnackbarItem,
        showDescModal,
        setShowDescModal,
        t2DIDResponse,
        setT2DIDResponse,
        blurBG,
        setBlurBG,
        showTokenModal,
        setShowTokenModal,
        selectTokenPos,
        showConfirmTxDetails,
        setShowConfirmTxDetails,
        preTxDetails,
        setPreTxDetails,
        executeSwap,
        setExecuteSwap,
        txApproved,
        setTxApproved,
        executeStake,
        setExecuteStake,
        executeUnstake,
        setExecuteUnstake,
        executeUnlock,
        setExecuteUnlock,
        approving,
        setApproving,
        importPool,
        setImportPool,
        swapFee,
        setSwapFee,
        afterSlippage,
        setAfterSlippage,
        showTxSettings,
        setShowTxSettings,
        slippage,
        setSlippage,
        exactToken,
        setExactToken,
        meta,
        setMeta,
        balanceTokenIn,
        setBalanceTokenIn,
        setBalanceTokenOut,
        balanceTokenOut,
        unstakeAllowance,
        setUnstakeAllowance,
      }}
    >
      <>{children}</>
    </GlobalContext.Provider>
  );
};
