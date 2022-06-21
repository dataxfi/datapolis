import React from 'react';
import BigNumber from 'bignumber.js';
import { ITList, ITokenInfo, IToken, Config, Watcher, Stake, Trade } from '@dataxfi/datax.js';
import { TransactionReceipt } from 'web3-core';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import { Pathfinder } from '@dataxfi/pathfinder/dist';

export type ApprovalStates = 'approved' | 'approving' | 'pending';
export type screenSize = 'mobile' | 'desktop';
export type BalancePos = 1 | 2 | 'stake';
export type ITxType = 'swap' | 'stake' | 'unstake' | 'approve';
export type LocalStorageMethods = 'get' | 'set' | 'clear' | 'remove' | 'key' | 'length';
export type TokenSelectTitles =
  | 'You are buying'
  | 'You are selling'
  | 'Datatoken pool'
  | 'You are staking'
  | 'You will receive';

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

export interface IPoolLiquidity {
  dtAmount: BigNumber;
  baseAmount: BigNumber;
}

export interface IPoolMetaData {
  address: string;
  baseToken: ITokenInfo;
  otherToken: ITokenInfo;
}

export interface ITxDetails {
  accountId: string;
  txDateId: string;
  tokenIn: IToken;
  tokenOut: IToken;
  status: 'Pending' | 'Indexing' | 'Success' | 'Failure';
  txType: ITxType;
  slippage?: BigNumber;
  shares?: BigNumber;
  txReceipt?: TransactionReceipt;
  postExchange?: BigNumber;
  pool?: IPoolMetaData;
}

export interface IUserMessage {
  message?: any;
  link?: string | { href: string; desc: string } | null;
  type: string;
  alert?: any;
  newTx?: ITxDetails;
}

export interface ISnackbarItem {
  message?: string;
  type: 'alert' | 'error' | 'tx';
  newTx?: ITxDetails;
  error?: { code: number; message: string; error: any };
}

export interface IMaxEval {
  t1Max: BigNumber;
  t2Max: BigNumber;
  t1Input: BigNumber;
  t2Input: BigNumber;
  limit: 'max' | 'bal';
}
// maybe delete?
export interface ILiquidityPosition {
  // user wallet ID (hash)
  accountId: string;
  // pool address
  address: string;
  // tokens in pool
  token1Info: ITokenInfo;
  token2Info: ITokenInfo;
  // the amount of shares you own
  shares: BigNumber;
  // total dt in pool
  dtAmount?: BigNumber;
  // total ocean in pool
  baseAmount?: BigNumber;
  // total shares in pool
  totalPoolShares?: BigNumber;
  // you share percentage in pool
  yourPoolSharePerc?: BigNumber;
}

export interface ITxHistory {
  [txDateId: string]: ITxDetails;
}

export interface ITxSelection extends ITxDetails {
  txLink: string;
}

export interface IDisclaimerSigned {
  client: boolean | null;
  wallet: boolean | null;
}

export type supportedChains = '1' | '4' | '137' | '56' | '1285' | '246';
export interface globalStates {
  handleConnect: Function;
  buttonText: string;
  accountId?: string;
  chainId?: supportedChains;
  provider?: Web3Modal;
  web3?: Web3;
  config?: Config;
  unsupportedNet: boolean;
  stake: Stake | undefined;
  refAddress: string | undefined;
  trade: Trade | undefined;
  pathfinder: Pathfinder | undefined;
  handleSignature: (account: string, web3: Web3, bypass: boolean) => Promise<string>;
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
  datatokens?: ITokenInfo[];
  setDatatokens: React.Dispatch<React.SetStateAction<ITokenInfo[] | undefined>>;
  ERC20Tokens?: ITokenInfo[];
  setERC20Tokens: React.Dispatch<React.SetStateAction<ITokenInfo[] | undefined>>;
  dtTokenResponse?: ITList;
  setDtTokenResponse: React.Dispatch<React.SetStateAction<ITList | undefined>>;
  ERC20TokenResponse?: ITList;
  setERC20TokenResponse: React.Dispatch<React.SetStateAction<ITList | undefined>>;
  singleLiquidityPos?: ILiquidityPosition;
  setSingleLiquidityPos: React.Dispatch<React.SetStateAction<ILiquidityPosition | undefined>>;
  txHistory?: ITxHistory;
  setTxHistory: React.Dispatch<React.SetStateAction<ITxHistory | undefined>>;
  lastTx?: ITxDetails;
  setLastTx: React.Dispatch<React.SetStateAction<ITxDetails | undefined>>;
  pendingTxs: string[];
  setPendingTxs: React.Dispatch<React.SetStateAction<string[]>>;
  showSnackbar: boolean;
  setShowSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
  showTxHistoryModal: boolean;
  setShowTxHistoryModal: React.Dispatch<React.SetStateAction<boolean>>;
  watcher?: Watcher;
  setWatcher: React.Dispatch<React.SetStateAction<Watcher | undefined>>;
  confirmingTx: boolean;
  setConfirmingTx: React.Dispatch<React.SetStateAction<boolean>>;
  showTxDone: boolean;
  setShowTxDone: React.Dispatch<React.SetStateAction<boolean>>;
  showUnlockTokenModal: boolean;
  setShowUnlockTokenModal: React.Dispatch<React.SetStateAction<boolean>>;
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  bgOff: boolean;
  setBgOff: React.Dispatch<React.SetStateAction<boolean>>;
  tokenIn: IToken;
  setTokenIn: React.Dispatch<React.SetStateAction<IToken>>;
  tokenOut: IToken;
  setTokenOut: React.Dispatch<React.SetStateAction<IToken>>;
  tokensCleared: React.MutableRefObject<boolean>;
  snackbarItem?: ISnackbarItem;
  setSnackbarItem: React.Dispatch<React.SetStateAction<ISnackbarItem | undefined>>;
  showDescModal: boolean;
  setShowDescModal: React.Dispatch<React.SetStateAction<boolean>>;
  t2DIDResponse: any;
  setT2DIDResponse: React.Dispatch<React.SetStateAction<any>>;
  blurBG: boolean;
  setBlurBG: React.Dispatch<React.SetStateAction<boolean>>;
  showTokenModal: boolean;
  setShowTokenModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectTokenPos: React.MutableRefObject<1 | 2 | null>;
  showConfirmTxDetails: boolean;
  setShowConfirmTxDetails: React.Dispatch<React.SetStateAction<boolean>>;
  preTxDetails?: ITxDetails;
  setPreTxDetails: React.Dispatch<React.SetStateAction<ITxDetails | undefined>>;
  txApproved: boolean;
  setTxApproved: React.Dispatch<React.SetStateAction<boolean>>;
  showTxSettings: boolean;
  setShowTxSettings: React.Dispatch<React.SetStateAction<boolean>>;
  executeSwap: boolean;
  setExecuteSwap: React.Dispatch<React.SetStateAction<boolean>>;
  executeStake: boolean;
  setExecuteStake: React.Dispatch<React.SetStateAction<boolean>>;
  executeUnstake: boolean;
  setExecuteUnstake: React.Dispatch<React.SetStateAction<boolean>>;
  executeUnlock: boolean;
  setExecuteUnlock: React.Dispatch<React.SetStateAction<boolean>>;
  approving: ApprovalStates;
  setApproving: React.Dispatch<React.SetStateAction<ApprovalStates>>;
  importPool?: string;
  setImportPool: React.Dispatch<React.SetStateAction<string | undefined>>;
  swapFee: BigNumber;
  setSwapFee: React.Dispatch<React.SetStateAction<BigNumber>>;
  afterSlippage: BigNumber;
  setAfterSlippage: React.Dispatch<React.SetStateAction<BigNumber>>;
  slippage: BigNumber;
  setSlippage: React.Dispatch<React.SetStateAction<BigNumber>>;
  exactToken: 1 | 2;
  setExactToken: React.Dispatch<React.SetStateAction<1 | 2>>;
  path: string[] | undefined;
  setPath: React.Dispatch<React.SetStateAction<string[] | undefined>>;
}
