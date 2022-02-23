import Web3 from "web3";
import Watcher from "@dataxfi/datax.js/dist/Watcher";
import { Ocean, Config } from "@dataxfi/datax.js";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import Core from "web3modal";
import { Disclaimer } from "../components/DisclaimerModal";
import {
  connectedMultipleWalletsGA,
  connectedWalletGA,
  connectedToNetworkGA,
  deniedSignatureGA,
  connectedWalletViaGA,
} from "./Analytics";
import { IDisclaimerSigned, globalStates, ILiquidityPosition, IToken, ITxHistory, IUserMessage } from "../utils/types";
import BigNumber from 'bignumber.js'
import { TList, TokenInfo } from "@dataxfi/datax.js/dist/TokenList"

const CONNECT_TEXT = "Connect Wallet";
export const INITIAL_TOKEN_STATE: IToken = {
  info: null,
  value: new BigNumber(0),
  balance: new BigNumber(0),
  percentage: new BigNumber(0),
  loading: false,
};
export const GlobalContext = createContext<globalStates>({} as globalStates);

//use these states to ensure proper management of bgLoading ops
export const bgLoadingStates = {
  allStakedPools: "stake",
  tokenList: "tokens",
  singlePoolData: "pool",
  allTxHistory: "history",
  singleTx: "tx",
  txPending: "txPending",
  maxStake: "maxStake",
  maxUnstake: "maxUnstake",
  balance: "balance",
  maxExchange: "maxExchange",
  calcTrade: "calcTrade",
};

export function removeBgLoadingState(bgLoading: string[], state: string): string[] {
  const newBgLoading = bgLoading.filter((s: string) => s !== state);
  return newBgLoading;
}

export const GlobalProvider = ({ children }: { children: PropsWithChildren<{}> }) => {
  const NETWORK = "mainnet";
  // const [state, dispatch]: [any, Function] = useReducer(AppReducer, initialState)

  // essential states for connection to web3, user wallet, ocean operations, and DataX configurations
  const [web3Modal, setWeb3Modal] = useState<Core>();
  const [accountId, setAccountId] = useState<string>();
  const [chainId, setChainId] = useState<number>();
  const [provider, setProvider] = useState<Web3Modal>();
  const [web3, setWeb3] = useState<Web3>();
  const [ocean, setOcean] = useState<Ocean>();
  const [config, setConfig] = useState<Config>();
  const [watcher, setWatcher] = useState<Watcher>();
  const [unsupportedNet, setUnsupportedNet] = useState<boolean>(false);

  //states responsible for user info collection
  const [cookiesAllowed, setCookiesAllowed] = useState<boolean | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);
  const [disclaimerSigned, setDisclaimerSigned] = useState<IDisclaimerSigned>({
    client: null,
    wallet: null,
  });

  // loading state is to be used when the app needs to finish loading before a page can render (i.e. show loading screen)
  const [loading, setLoading] = useState<boolean>(true);

  // bg loading is to be used when the app can render the page without needing to finish loading
  // when using bg loading push a loading item with the operation name (using bgLoadingStates)
  // consider using type Set<string>
  const [bgLoading, setBgLoading] = useState<string[]>([]);

  //array of pending transaction Ids
  const [pendingTxs, setPendingTxs] = useState<number[]>([]);

  //Transaction and tx modal states
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [showTxHistoryModal, setShowTxHistoryModal] = useState<boolean>(false);
  //all transaction history
  const [txHistory, setTxHistory] = useState<ITxHistory>();

  // (user)confirmModal and txDone state for specific transactions
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTxDone, setShowTxDone] = useState(false);

  //all stake pool information for the current user
  const [allStakedPools, setAllStakedPools] = useState<ILiquidityPosition[]>();
  //Pool information associated with pool
  const [singleLiquidityPos, setSingleLiquidityPos] = useState<ILiquidityPosition>();
  //Stake pool sync timeout
  const [stakeFetchTimeout, setStakeFetchTimeout] = useState<boolean>(false);

  //tokenModalArray to be rendered in token modal
  const [tokenModalArray, setTokenModalArray] = useState<TokenInfo[]>();
  //current token pair to be traded, staked, etc
  const [token1, setToken1] = useState<IToken>(INITIAL_TOKEN_STATE)
  const [token2, setToken2] = useState<IToken>(INITIAL_TOKEN_STATE)

  //response from token fetch operation
  const [tokenResponse, setTokenResponse] = useState<TList>();

  const [buttonText, setButtonText] = useState<string>(CONNECT_TEXT);


  const [notifications, setNotifications] = useState<IUserMessage[]>([]);

  const [showUnlockTokenModal, setShowUnlockTokenModal] = useState<boolean>(false);

  const [location, setLocation] = useState<string>("/");

  const [bgOff, setBgOff] = useState(false);

  // remove all pending signatures to instantiate disclaimer flow upon user reconnection
  useEffect(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key || "");
      if (value === "pending") localStorage.removeItem(key || "");
    }

    const bgPref = localStorage.getItem("bgPref");
    if (bgPref) setBgOff(JSON.parse(bgPref));
  }, []);

  // recall handle connect if the provider is set but there is no account id
  // essential for disclaimer flow
  useEffect(() => {
    if (provider && !accountId && disclaimerSigned.wallet !== "denied" && disclaimerSigned.client !== "denied") {
      handleConnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disclaimerSigned.client, disclaimerSigned.wallet]);

  // intitialize web3modal to use to connect to provider
  useEffect(() => {
    async function init() {
      const web3Modal = new Web3Modal({
        network: "mainnet", // optional
        cacheProvider: true, // optional
        theme: "dark",
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider, // required
            options: {
              infuraId: process.env.REACT_APP_INFURA_ID, // required
            },
          },
        }, // required
      });

      setWeb3Modal(web3Modal);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  async function handleSignature() {
    if (!web3) return;
    let accounts = await web3.eth.getAccounts();
    const account = accounts[0].toLowerCase();

    try {
      localStorage.setItem(account, "pending");
      let signature = await web3.eth.personal.sign(Disclaimer(), account || "", "", () => {
        setShowDisclaimer(false);
      });
      console.log(signature);

      localStorage.setItem(account, signature);
      setDisclaimerSigned({ ...disclaimerSigned, wallet: true });
      return signature;
    } catch (error) {
      console.error(error);
      localStorage.removeItem(account);
      deniedSignatureGA();
    }
    return false;
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

  async function handleDisclaimer(account: string, localSignature: string | null): Promise<any> {
    account = account.toLowerCase();
    if (!localSignature || localSignature === "pending") {
      setShowDisclaimer(true);
    }
    return localSignature;
  }

  /**
   * Handles connection to web3 and user wallet.
   */
  async function handleConnect() {
    try {
      const provider = await web3Modal?.connect();
      setProvider(provider);
      const web3 = new Web3(provider);
      console.log("Web3");
      console.log(web3);
      setWeb3(web3);

      let accounts = await web3.eth.getAccounts();
      let account = accounts[0] ? accounts[0].toLowerCase() : null;
      const localSignature = localStorage.getItem(account ? account : "");

      if (localSignature && localSignature !== "pending") {
        let _chainId = parseInt(String(await web3.eth.getChainId()));
        setChainId(_chainId);

        // This is required to do wallet-specific functions
        const ocean = new Ocean(web3, String(_chainId));
        setOcean(ocean);
        console.log("chainID - ", chainId);
        console.log("Pre chainID - ", _chainId);
        const config = new Config(web3, String(_chainId));
        setConfig(config);
        console.log(config);
        const watcher = new Watcher(web3, String(_chainId));
        setWatcher(watcher);
        isSupportedChain(config, String(_chainId), accounts[0] ? accounts[0] : "");
      } else {
        await handleDisclaimer(accounts[0], localSignature);
      }
      setListeners(provider, web3);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Verifies the chain the current wallet is on is supported by DataX before connecting.
   *
   * @param config
   * @param chainId
   * @param account
   * @returns
   */

  function isSupportedChain(config: Config, chainId: string, account?: string) {
    try {
      const network = config.getNetwork(chainId);
      connectedToNetworkGA({ network, chainId });
      if (network === "unknown") {
        setAccountId(undefined);
        setButtonText(CONNECT_TEXT);
        setUnsupportedNet(true);
      } else {
        setUnsupportedNet(false);
        console.log("Account Id - ", accountId);
        console.log("Pre Account Id - ", account);
        //account is null when chain changes to prevent switching to an unsigned account
        setAccountId(account);
        setButtonText(account || CONNECT_TEXT);
        connectedWalletGA();
        const wallet = localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER") || "unknown";
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
    provider.on("accountsChanged", (accounts: any) => {
      let account = accounts[0] ? accounts[0].toLowerCase() : null;
      const localSignature = localStorage.getItem(account ? account : "");
      if (localSignature && localSignature !== "pending") {
        console.log("Accounts changed to - ", accounts[0]);
        console.log("Connected Accounts - ", JSON.stringify(accounts));
        setAccountId(accounts[0]);
        setButtonText(accounts.length && accounts[0] !== "" ? accounts[0] : CONNECT_TEXT);
        setDisclaimerSigned({ client: true, wallet: true });
        setShowDisclaimer(false);
        connectedMultipleWalletsGA();
        connectedWalletGA();
      } else {
        setAccountId(undefined);
        setButtonText(CONNECT_TEXT);
        setChainId(undefined);
        setDisclaimerSigned({ client: false, wallet: false });
      }
    });

    // Subscribe to chainId change
    provider.on("chainChanged", async (chainId: any) => {
      setToken1(INITIAL_TOKEN_STATE)
      setToken2(INITIAL_TOKEN_STATE)
      setTxHistory(undefined);
      setPendingTxs([]);
      const parsedId = String(parseInt(chainId));
      console.log(chainId);
      console.log("Chain changed to ", parsedId);
      setChainId(parseInt(chainId));
      const config = new Config(web3, parsedId);
      console.log("Config for new chain:");
      setConfig(config);
      setOcean(new Ocean(web3, String(parseInt(chainId))));
      isSupportedChain(config, parsedId, undefined);
    });

    // Subscribe to provider connection
    provider.on("connect", (info: { chainId: number }) => {
      console.log("Connect event fired");
      console.log(info);
    });

    // Subscribe to provider disconnection
    provider.on("disconnect", (error: { code: number; message: string }) => {
      console.log(error);
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
        ocean,
        network: NETWORK,
        config,
        unsupportedNet,
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
        tokenModalArray,
        setTokenModalArray,
        tokenResponse,
        setTokenResponse,
        singleLiquidityPos,
        setSingleLiquidityPos,
        bgLoading,
        setBgLoading,
        txHistory,
        setTxHistory,
        showSnackbar,
        setShowSnackbar,
        pendingTxs,
        setPendingTxs,
        showTxHistoryModal,
        setShowTxHistoryModal,
        watcher,
        setWatcher,
        showConfirmModal,
        setShowConfirmModal,
        showTxDone,
        setShowTxDone,
        stakeFetchTimeout,
        setStakeFetchTimeout,
        notifications,
        setNotifications,
        showUnlockTokenModal,
        setShowUnlockTokenModal,
        location,
        setLocation,
        bgOff,
        setBgOff,
        token1, 
        setToken1, 
        token2, 
        setToken2
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
