import BigNumber from "bignumber.js";
import { TokenDetails } from "@dataxfi/datax.js/dist/Ocean";
import { TransactionReceipt } from "web3-core";
import { Config, Ocean} from "@dataxfi/datax.js";
import { TList, TokenInfo } from "@dataxfi/datax.js/dist/TokenList"
import Web3 from "web3";
import Web3Modal from "web3modal";
import Watcher from "@dataxfi/datax.js/dist/Watcher";


export type ApprovalStates = "approved" | "approving" | "pending";

export interface IBtnProps {
  classes?: string;
  text: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  id?: string;
}

export interface INavText {
  T_SWAP: string;
  T_STAKE: string;
  T_CONNECT_WALLET: string;
}

export interface IMaxUnstake {
  OCEAN: BigNumber;
  shares: BigNumber;
  userPerc: BigNumber;
}

export interface IPoolLiquidity {
  dtAmount: BigNumber;
  oceanAmount: BigNumber;
}

export interface IToken {
  balance: BigNumber;
  value: BigNumber;
  info: TokenInfo | null;
  loading: boolean;
  percentage: BigNumber;
  allowance?: BigNumber;
}

export type TokenSelectTitles = "You are buying" | "You are selling" | "Token"

export interface IMaxExchange {
  maxBuy: BigNumber;
  maxSell: BigNumber;
  maxPercent: BigNumber;
  postExchange: BigNumber;
}

export interface ITokenValues {
  t1Val: string;
  t2Val: string;
  t1BN: BigNumber;
  t2BN: BigNumber;
}

export interface IUserMessage {
  message?: any;
  link?: string | { href: string; desc: string } | null;
  type: string;
  alert?: any;
  newTx?: ITxDetails
}


export interface IMaxEval {
  t1Max: BigNumber;
  t2Max: BigNumber;
  t1Input: BigNumber;
  t2Input: BigNumber;
  limit: "max" | "bal";
}

export interface ITokenDetails extends TokenDetails {
  tokenAddress: string;
}

export interface ILiquidityPosition {
  //user wallet ID (hash)
  accountId: string;
  //pool address
  address: string;
  //tokens in pool
  token1Info: TokenInfo;
  token2Info: TokenInfo;
  //the amount of shares you own
  shares: BigNumber;
  //total dt in pool
  dtAmount?: BigNumber;
  //total ocean in pool
  oceanAmount?: BigNumber;
  //total shares in pool
  totalPoolShares?: BigNumber;
  //you share percentage in pool
  yourPoolSharePerc?: BigNumber;
}

export type BalancePos = 1 | 2 | "stake";
export type ITxType = "trade" | "stake" | "unstake" | "approve";
export type LocalStorageMethods = "get" | "set" | "clear" | "remove" | "key" | "length";

// export interface ITxTokenDetails {
//   balance: string;
//   info: TokenInfo;
//   percentage: string;
//   value: string;
// }

export interface ITxDetails {
  accountId: string;
  txDateId: string;
  token1: IToken;
  token2: IToken;
  status: "Pending" | "Indexing" | "Success" | "Failure";
  txType: ITxType;
  slippage?: BigNumber;
  shares?: BigNumber;
  txReceipt?: TransactionReceipt;
}


export interface ITxHistory {
  [txDateId: string]: ITxDetails;
}

export interface ITxSelection extends ITxDetails {
  txLink: string;
}

export interface IDisclaimerSigned {
  client: boolean | null | "denied";
  wallet: boolean | null | "denied";
}


export interface globalStates {
  ocean?: Ocean;
  handleConnect: Function;
  buttonText: string;
  accountId?: string;
  chainId?: number;
  provider?: Web3Modal;
  web3?: Web3;
  network: string;
  config?: Config;
  unsupportedNet: boolean;
  handleSignature: Function;
  cookiesAllowed: boolean | null;
  setCookiesAllowed: React.Dispatch<React.SetStateAction<boolean | null>>;
  showDisclaimer: boolean;
  setShowDisclaimer: React.Dispatch<React.SetStateAction<boolean>>;
  disclaimerSigned: IDisclaimerSigned;
  setDisclaimerSigned: React.Dispatch<React.SetStateAction<IDisclaimerSigned>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  allStakedPools?: ILiquidityPosition[];
  setAllStakedPools: React.Dispatch<React.SetStateAction<ILiquidityPosition[] | undefined>>;
  tokenModalArray?: TokenInfo[];
  setTokenModalArray: React.Dispatch<React.SetStateAction<TokenInfo[] | undefined>>;
  tokenResponse?: TList;
  setTokenResponse: React.Dispatch<React.SetStateAction<TList | undefined>>;
  singleLiquidityPos?: ILiquidityPosition;
  setSingleLiquidityPos: React.Dispatch<React.SetStateAction<ILiquidityPosition | undefined>>;
  txHistory?: ITxHistory;
  setTxHistory: React.Dispatch<React.SetStateAction<ITxHistory | undefined>>;
  lastTx? : ITxDetails
  setLastTx : React.Dispatch<React.SetStateAction<ITxDetails | undefined>>
  pendingTxs: string[];
  setPendingTxs: React.Dispatch<React.SetStateAction<string[]>>;
  showSnackbar: boolean;
  setShowSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
  showTxHistoryModal: boolean;
  setShowTxHistoryModal: React.Dispatch<React.SetStateAction<boolean>>;
  watcher?: Watcher;
  setWatcher: React.Dispatch<React.SetStateAction<Watcher | undefined>>;
  showConfirmModal: boolean;
  setShowConfirmModal: React.Dispatch<React.SetStateAction<boolean>>;
  showTxDone: boolean;
  setShowTxDone: React.Dispatch<React.SetStateAction<boolean>>;
  stakeFetchTimeout: boolean;
  setStakeFetchTimeout: React.Dispatch<React.SetStateAction<boolean>>;
  notifications: IUserMessage[];
  setNotifications: React.Dispatch<React.SetStateAction<IUserMessage[]>>;
  showUnlockTokenModal: boolean;
  setShowUnlockTokenModal: React.Dispatch<React.SetStateAction<boolean>>;
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  bgOff: boolean;
  setBgOff: React.Dispatch<React.SetStateAction<boolean>>;
  token1: IToken;
  setToken1: React.Dispatch<React.SetStateAction<IToken>>;
  token2: IToken;
  setToken2: React.Dispatch<React.SetStateAction<IToken>>;
  tokensCleared: React.MutableRefObject<boolean> , 
}

