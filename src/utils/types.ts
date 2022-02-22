import BigNumber from "bignumber.js";
import { TokenDetails } from "@dataxfi/datax.js/dist/Ocean";
import { TransactionReceipt } from "web3-core";
import { Config, Ocean } from "@dataxfi/datax.js";
import Web3 from "web3";
import Web3Modal from "web3modal";
import Watcher from "@dataxfi/datax.js/dist/Watcher";
import Core from "web3modal";
export type ApprovalStates = "approved" | "approving" | "pending";

export interface IBtnProps {
  classes?: string;
  text: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  id?: string;
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
  value: BigNumber | string;
  info: ITokenInfo | null;
  loading: boolean;
  percentage: BigNumber;
  allowance?: BigNumber;
}

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
  alert?: any
}

export interface ITokenInfo {
  address: string;
  chainId: string | number;
  decimals: string | number;
  logoURI: string;
  name: string;
  symbol: string;
  pool: string;
  tags?: string[];
}

export interface ITokenList {
  name: string;
  logoURI: string;
  keywords: string[];
  tags: {
    datatokens: {
      name: string;
      description: string;
    };
  };
  timestamp: string;
  tokens: ITokenInfo[];
  version: {
    major: number;
    minor: number;
    patch: number;
  };
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

export interface IPoolData {
  //user wallet ID (hash)
  accountId: string;
  //pool address
  address: string;
  //tokens in pool
  token1: ITokenInfo;
  token2: ITokenInfo;
  //the amount of shares you own
  shares: string;
  //total dt in pool
  dtAmount?: string;
  //total ocean in pool
  oceanAmount?: string;
  //total shares in pool
  totalPoolShares?: string;
  //you share percentage in pool
  yourPoolSharePerc?: string;
}

export type BalancePos = 1 | 2 | "stake";
export type ITxType = "trade" | "stake" | "unstake";
export type LocalStorageMethods = "get" | "set" | "clear" | "remove" | "key" | "length";

export interface ITxTokenDetails {
  balance: string;
  info: ITokenInfo;
  percentage: string;
  value: string;
}

export interface ITxObject {
  accountId: string;
  token1: ITxTokenDetails | ITokenInfo;
  token2: ITxTokenDetails | ITokenInfo;
  txHash: string | null;
  status: string;
  txType: string;
  slippage?: string;
  stakeAmt?: string;
  txReceipt?: TransactionReceipt;
}

export interface ITxHistory {
  [txDateId: string]: ITxObject;
}

export interface ITxSelection extends ITxObject {
  txDateId: string | number;
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
  setCookiesAllowed: Function;
  showDisclaimer: boolean;
  setShowDisclaimer: Function;
  disclaimerSigned: IDisclaimerSigned;
  setDisclaimerSigned: Function;
  loading: boolean;
  setLoading: Function;
  allStakedPools?: IPoolData[];
  setAllStakedPools: Function;
  tokenModalArray?: ITokenInfo[];
  setTokenModalArray: Function;
  tokenResponse?: ITokenList;
  setTokenResponse: Function;
  currentStakeToken: any;
  setCurrentStakeToken: Function;
  currentStakePool?: IPoolData;
  setCurrentStakePool: Function;
  bgLoading: string[];
  setBgLoading: Function;
  txHistory?: ITxHistory;
  setTxHistory: Function;
  showSnackbar: boolean;
  setShowSnackbar: Function;
  pendingTxs: number[];
  setPendingTxs: Function;
  showTxHistoryModal: boolean;
  setShowTxHistoryModal: Function;
  watcher?: Watcher;
  setWatcher: Function;
  showConfirmModal: boolean;
  setShowConfirmModal: Function;
  showTxDone: boolean;
  setShowTxDone: Function;
  stakeFetchTimeout: boolean;
  setStakeFetchTimeout: Function;
  notifications: IUserMessage[];
  setNotifications: Function;
  showUnlockTokenModal: boolean;
  setShowUnlockTokenModal: Function;
  location: string;
  setLocation: Function;
  bgOff: boolean;
  setBgOff: Function;
}

export const initialState: globalStates = {
  handleConnect : () => {},
  buttonText : "Connect Wallet",
  chainId : undefined,
  network : "unknown",
  unsupportedNet : false,
  handleSignature : () => {},
  cookiesAllowed : null,
  setCookiesAllowed : () => {},
  showDisclaimer : false,
  setShowDisclaimer : () => {},
  disclaimerSigned : { client: false, wallet: false },
  setDisclaimerSigned : () => {},
  loading : false,
  setLoading : () => {},
  setAllStakedPools : () => {},
  setTokenModalArray : () => {},
  setTokenResponse : () => {},
  currentStakeToken : null,
  setCurrentStakeToken : () => {},
  setCurrentStakePool : () => {},
  bgLoading : [],
  setBgLoading : () => {},
  setTxHistory : () => {},
  showSnackbar : false,
  setShowSnackbar : () => {},
  pendingTxs : [],
  setPendingTxs : () => {},
  showTxHistoryModal : false,
  setShowTxHistoryModal : () => {},
  setWatcher : () => {},
  showConfirmModal : false,
  setShowConfirmModal : () => {},
  showTxDone : false,
  setShowTxDone : () => {},
  stakeFetchTimeout : false,
  setStakeFetchTimeout : () => {},
  notifications : [],
  setNotifications : () => {},
  showUnlockTokenModal : false,
  setShowUnlockTokenModal : () => {},
  location : "/",
  setLocation : () => {},
  bgOff : false,
  setBgOff : () => {},
};
