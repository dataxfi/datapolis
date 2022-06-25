export interface IPoolNode {
  poolAddress: string;
  t1Address: string;
  t2Address: string;
  t1Liquidity: string;
  t2Liquidity: string;
  edges: Set<string>;
}
export interface INextTokensToSearch {
  [tokenAdress: number]: { parentToken: string; amt?: number };
}

export interface IPoolGraph {
  [tokenAddress: string]: IPoolNode;
}

export interface ITokenGraph {
  [tokenAddress: string]: { parent: string; pools: IPoolGraph };
}

export interface IBFSResultPoolNode {
  pool: IPoolNode;
  parent: string;
}
export interface IBFSResults {
  [key: string]: IBFSResultPoolNode;
}

export type supportedChains = "1" | "4" | "56" | "137" | "246" | "1285";
