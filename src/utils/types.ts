import BigNumber from "bignumber.js";
import { TokenDetails } from "@dataxfi/datax.js/dist/Ocean";

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
  info: any; //TokenInfo ;
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

export interface ITokenTypes {
  t1Val: string;
  t2Val: string;
  t1BN: BigNumber;
  t2BN: BigNumber;
}

export interface IUserMessage {
  message: any;
  link: string | { href: string; desc: string } | null;
  type: string;
}

export interface TokenInfo {
  address: string;
  chainId: string | number;
  decimals: string | number;
  logoURI: string;
  name: string;
  symbol: string;
  pool: string;
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
  tokens: TokenInfo[];
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

export interface PoolData {
  //user wallet ID (hash)
  accountId: string;
  //pool address
  address: string;
  //tokens in pool
  token1: ITokenDetails;
  token2: ITokenDetails;
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
