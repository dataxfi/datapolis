import Web3 from "web3";
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
import { TokenDetails } from "@dataxfi/datax.js/dist/Ocean";

const initialState: any = {};
const CONNECT_TEXT = "Connect Wallet";

export const GlobalContext = createContext(initialState);


export interface PoolData {
  accountId: string;
  address: string;
  token1: TokenDetails;
  token2: TokenDetails;
  shares: string;
  dtAmount?: string;
  oceanAmount?: string;
  totalPoolShares?: string;
  yourPoolShare?: string;
}

export const GlobalProvider = ({
  children,
}: {
  children: PropsWithChildren<{}>;
}) => {
  const NETWORK = "mainnet";
  // const [state, dispatch]: [any, Function] = useReducer(AppReducer, initialState)
  interface DisclaimerObj {
    client: boolean | null;
    wallet: boolean | null;
  }
  const [web3Modal, setWeb3Modal] = useState<Core | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [ocean, setOcean] = useState<Ocean | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [cookiesAllowed, setCookiesAllowed] = useState<boolean | null>(null);
  const [unsupportedNet, setUnsupportedNet] = useState<boolean>(false);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [allStakedPools, setAllStakedPools] = useState<PoolData[] | null>(null);


  const [disclaimerSigned, setDisclaimerSigned] = useState<DisclaimerObj>({
    client: null,
    wallet: null,
  });

  const [buttonText, setButtonText] = useState<string | undefined>(
    CONNECT_TEXT
  );

  useEffect(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key || "");
      if (value === "pending") localStorage.removeItem(key || "");
    }
  }, []);

  useEffect(() => {
    if (provider && !accountId) {
      handleConnect();
    }
  }, [disclaimerSigned.client, disclaimerSigned.wallet]);

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

  // async function setupWeb3AndOcean(){
  //   const provider = await web3Modal?.connect()
  //   setProvider(provider)

  //   // This is required to get the token list
  //   const web3 = new Web3(provider)
  //   setWeb3(web3)
  // }

  async function handleSignature(account: string, web3: Web3) {
    try {
      localStorage.setItem(account, "pending");
      let signature = await web3.eth.personal.sign(
        Disclaimer(),
        account || "",
        "",
        () => {
          setShowDisclaimer(false);
        }
      );
      localStorage.setItem(account, signature);
      setDisclaimerSigned({ ...disclaimerSigned, wallet: true });
      return signature;
    } catch (error) {
      console.error(error);
      localStorage.removeItem(account);
      deniedSignatureGA();
    }
  }

  async function handleDisclaimer(
    account: string,
    web3: Web3,
    localSignature: string | null
  ): Promise<any> {
    account = account.toLowerCase();
    if (!localSignature || localSignature === "pending") {
      setShowDisclaimer(true);
    }

    if (disclaimerSigned.client === true) {
      handleSignature(account, web3);
    }

    return localSignature;
  }

  async function handleConnect() {
    const provider = await web3Modal?.connect();
    setProvider(provider);
    // // This is required to get the token list
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

      isSupportedChain(
        config,
        String(_chainId),
        accounts[0] ? accounts[0] : ""
      );
    } else {
      handleDisclaimer(accounts[0], web3, localSignature);
    }
    setListeners(provider, web3);
  }

  function isSupportedChain(
    config: Config,
    chainId: string,
    account: string | null
  ) {
    const network = config.getNetwork(chainId);
    connectedToNetworkGA({ network, chainId });
    if (network === "unknown") {
      setAccountId(null);
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
      const wallet =
        localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER") || "unknown";
      connectedWalletViaGA({ wallet });
      return true;
    }
  }

  function setListeners(provider: any, web3: Web3) {
    provider.on("accountsChanged", (accounts: any) => {
      let account = accounts[0] ? accounts[0].toLowerCase() : null;
      const localSignature = localStorage.getItem(account ? account : "");
      console.log("accountsChanged");
      if (localSignature && localSignature !== "pending") {
        console.log("Accounts changed to - ", accounts[0]);
        console.log("Connected Accounts - ", JSON.stringify(accounts));
        setAccountId(accounts[0]);
        setButtonText(
          accounts.length && accounts[0] !== "" ? accounts[0] : CONNECT_TEXT
        );
        connectedMultipleWalletsGA();
        connectedWalletGA();
      } else {
        setAccountId(null);
        setButtonText(CONNECT_TEXT);
        setChainId(undefined);
        setDisclaimerSigned({ client: false, wallet: false });
        handleDisclaimer(accounts[0], web3, localSignature);
      }
    });

    // Subscribe to chainId change
    provider.on("chainChanged", async (chainId: any) => {
      const parsedId = String(parseInt(chainId));
      console.log(chainId);
      console.log("Chain changed to ", parsedId);
      setChainId(parseInt(chainId));
      const config = new Config(web3, parsedId);
      setConfig(config);
      setOcean(new Ocean(web3, String(parseInt(chainId))));
      isSupportedChain(config, parsedId, null);
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
        setAllStakedPools
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
