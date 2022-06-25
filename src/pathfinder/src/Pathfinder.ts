import { Trade } from "@dataxfi/datax.js";
import Web3 from "web3";
import { INextTokensToSearch, IPoolGraph, IPoolNode, ITokenGraph, supportedChains } from "./@types";
import { bscPools, energywebPools, mainnetPools, maticPools, moonriverPools, rinkebyPools } from "./util";

export default class Pathfinder {
  private fetchFunction;
  public nodes: ITokenGraph;
  public tokensChecked: Set<string>;
  private pendingQueries: Set<string>;
  private userTokenIn: string;
  private userTokenOut: string;
  private chainId;
  private allPaths: string[][] = [];
  private trade: Trade;

  constructor(chainId: supportedChains, web3?: Web3) {
    this.nodes = {};
    this.tokensChecked = new Set();
    this.pendingQueries = new Set();
    this.userTokenIn = "";
    this.userTokenOut = "";
    this.chainId = chainId;
    // this.trade = new Trade(web3, chainId);

    switch (Number(this.chainId)) {
      case 4:
        this.fetchFunction = rinkebyPools;
        break;
      case 137:
        this.fetchFunction = maticPools;
        break;
      case 56:
        this.fetchFunction = bscPools;
        break;
      case 1285:
        this.fetchFunction = moonriverPools;
        break;
      case 246:
        this.fetchFunction = energywebPools;
        break;
      default:
        this.fetchFunction = mainnetPools;
        break;
    }
  }

  /**
   * Adds a pool node to the tokenNodes 'pool' attribute (subgraph).
   * @param poolNode The current poolNode (IPoolNode) from the fetch request iteration.
   * @param tokenNode The tokenNode to add poolNode to its 'pool' attribute.
   */

  private addPoolNode(poolNode: IPoolNode, tokenNode: IPoolGraph) {
    tokenNode[poolNode.poolAddress] = poolNode;
  }

  /**
   * Adds a token node to the main graph.
   * @param tokenAdress The address of the token whos pools are being visited.
   * @param parentTokenAddress The IN token preceeding the prospective OUT tokens.
   */

  private addTokenNode(tokenAdress, parentTokenAddress) {
    if (!parentTokenAddress) parentTokenAddress = null;
    this.nodes[tokenAdress] = { parent: parentTokenAddress, pools: {} };
  }

  /**
   * Makes request for pools associated to a token, sets nodes on the graph for each pool.
   * @param param0
   * @returns The next tokens to be searched OR null if a path can be made.
   */
  public async searchPoolData({
    tokenAddress,
    destinationAddress,
    parentTokenAddress,
    IN,
    amt,
    poolsFromToken,
    nextTokensToSearch,
  }: {
    poolsFromToken: IPoolNode[];
    tokenAddress: string;
    destinationAddress: string;
    IN: boolean;
    parentTokenAddress: string;
    nextTokensToSearch: INextTokensToSearch;
    amt?: string;
  }): Promise<INextTokensToSearch | null> {
    return new Promise(async (resolve, reject) => {
      try {
        if (poolsFromToken.length === 0) {
          console.log("There are no pools for " + tokenAddress + " on this chain.");
          reject({ code: 1, message: "There are no pools for " + tokenAddress + " on this chain." });
        }
        //iterate pools response adding nodes and edges
        for (let i = 0; i < poolsFromToken.length; i++) {
          const poolNode = poolsFromToken[i];

          let t1IsIn = poolNode.t1Address === tokenAddress;

          if (this.nodes[tokenAddress]) {
            this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
          } else {
            this.addTokenNode(tokenAddress, parentTokenAddress);
            this.addPoolNode(poolNode, this.nodes[tokenAddress].pools);
          }

          const nextTokenAddress = poolNode.t1Address === tokenAddress ? poolNode.t2Address : poolNode.t1Address;
          //if exact token is token out, calculate what amount of the next token would be needed from the next pool
          let nextAmt;
          if (!IN) nextAmt = "1"; //await this.trade.getAmountsIn(amt, [parentTokenAddress, nextTokenAddress]);
          if (!nextTokensToSearch[nextTokenAddress])
            IN ? (nextTokensToSearch[nextTokenAddress] = { parent: tokenAddress }) : (nextTokensToSearch[nextTokenAddress] = { parent: tokenAddress, amt: nextAmt[0] });

          // //if exact token is token in, check if there is enough liquidity to support this swap
          // if (IN) {
          //   const amountOut = await this.trade.getAmountsOut(amt, [parentTokenAddress, nextTokenAddress]);
          //   const liquidityNeeded = t1IsIn ? poolNode.t2Liquidity : poolNode.t1Liquidity;
          //   if (amountOut[0] > liquidityNeeded) {
          //     resolve(null);
          //     return;
          //   }
          // }

          if (poolNode.t1Address === destinationAddress || poolNode.t2Address === destinationAddress) {
            this.addTokenNode(destinationAddress, tokenAddress);
            resolve(null);
            return;
          }
        }

        resolve(nextTokensToSearch);
      } catch (error) {
        console.error(error);
      }
    });
  }

  /**
   * Recursively calls subgraphs for all relevant pool data for a token.
   * @param tokenAddress The token to get pools for (token in)
   * @param destinationAddress The token to be attained (token out)
   * @param amt The amount of destination token desired
   * @param IN Wether the exact token is the token in
   * @param parentTokenAddress the token that was traded prior to the current token being searched (for recursion)
   * @param skip pagination for pool data requests (for recursion)
   * @param poolsFromToken all pool data from token (for recursion)
   * @param nextTokensToSearch all tokens to search next (for recursion)
   * @returns next tokens to search
   */
  private async getPoolData({
    tokenAddress,
    destinationAddress,
    amt,
    IN,
    parentTokenAddress,
    skip = 0,
    poolsFromToken = [],
    nextTokensToSearch = {},
  }: {
    tokenAddress: string;
    destinationAddress: string;
    IN: boolean;
    amt?: string;
    parentTokenAddress?: string;
    skip?: number;
    poolsFromToken?: IPoolNode[];
    nextTokensToSearch?: INextTokensToSearch;
  }): Promise<INextTokensToSearch> {
    try {
      tokenAddress = tokenAddress.toLowerCase();
      destinationAddress = destinationAddress.toLowerCase();

      // skip tokens already searched
      if (this.tokensChecked.has(tokenAddress)) return;

      this.pendingQueries.add(tokenAddress);

      // fetch results (200 max default)
      const response = await this.fetchFunction(tokenAddress, amt);
      if (!response) {
        throw new Error("Failed to retrieve subgraph data.");
      }
      console.log(response);
      poolsFromToken.push(...response);

      // search results for destination
      nextTokensToSearch = await this.searchPoolData({
        poolsFromToken,
        tokenAddress,
        destinationAddress,
        IN,
        parentTokenAddress,
        amt,
        nextTokensToSearch,
      });

      // recurse if results were >= 1000
      if (nextTokensToSearch && response.length >= 1000) {
        await this.getPoolData({
          tokenAddress,
          destinationAddress,
          parentTokenAddress,
          amt,
          IN,
          skip: skip + 1000,
          poolsFromToken,
          nextTokensToSearch,
        });
      } else {
        this.pendingQueries.delete(tokenAddress);
        this.tokensChecked.add(tokenAddress);

        // if there are no more results to be searched, return nextTokensToSearch
        return nextTokensToSearch;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gets token paths for a swap pair. Recursively calls itself until userTokenOut is found.
   * @param param0
   * @returns An array of tokens to be traded in order to route to the destination token in the shortest path possible.
   */
  private async getTokenPaths({
    tokenAddress,
    destinationAddress,
    IN,
    parentTokenAddress,
    amt,
  }: {
    tokenAddress: string;
    destinationAddress: string;
    IN: boolean;
    parentTokenAddress?: string;
    amt?: string;
  }): Promise<void> {
    tokenAddress = tokenAddress.toLowerCase();
    destinationAddress = destinationAddress.toLowerCase();

    if (!this.userTokenIn) this.userTokenIn = tokenAddress;
    if (!this.userTokenOut) this.userTokenOut = destinationAddress;

    try {
      const nextTokensToSearch = await this.getPoolData({ tokenAddress, destinationAddress, parentTokenAddress, amt, IN });

      if (nextTokensToSearch && Object.keys(nextTokensToSearch).length > 0) {
        for (let [token, value] of Object.entries(nextTokensToSearch)) {
          return this.getTokenPaths({ destinationAddress, tokenAddress: token, parentTokenAddress: value.parent, amt: value.amt, IN });
        }
      } else if (this.pendingQueries.size === 0) {
        const path = this.constructPath({ destination: this.userTokenOut });
        if (path) {
          this.allPaths.push(path);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Get best token path for swap pair. Awaits all results from getTokenPaths then
   * returns the shortest path.
   * @param param0
   * @returns
   */
  public async getTokenPath({
    tokenAddress,
    destinationAddress,
    amt,
    abortSignal,
    IN,
  }: {
    tokenAddress: string;
    destinationAddress: string;
    IN: boolean;
    parentTokenAddress?: string;
    amt?: string;
    abortSignal?: AbortSignal;
  }): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      abortSignal?.addEventListener("abort", () => {
        return reject(new Error("Aborted"));
      });

      await this.getTokenPaths({ tokenAddress, destinationAddress, amt, IN });
      if (this.pendingQueries.size === 0) {
        const path = await this.resolveAllPaths();
        resolve(path);
      }
    });
  }

  /**
   * Follows data from destination token to token in.
   * @param param0
   * @returns path as a string[]
   */
  private constructPath({ path, destination }: { path?: string[]; destination?: string }) {
    try {
      let parent: string;

      if (path) {
        parent = this.nodes[path[0]].parent;
      } else {
        path = [destination];
        parent = this.nodes[destination].parent;
      }

      if (parent) {
        path.unshift(parent);
        this.constructPath({ path });
      }
      return path;
    } catch (error) {
      console.error(error);
    }
  }

  private async resolveAllPaths() {
    let shortestPath: string[];
    const allPathsResolved = await Promise.allSettled(this.allPaths);
    allPathsResolved.forEach(async (promise) => {
      if (promise.status === "fulfilled") {
        const path = promise.value;
        if (!shortestPath || shortestPath.length > path.length) {
          shortestPath = path;
        }
      }
    });
    return shortestPath;
  }
}

const pathfinder = new Pathfinder("137");
pathfinder
  .getTokenPath({
    tokenAddress: "0x282d8efCe846A88B159800bd4130ad77443Fa1A1",
    destinationAddress: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    IN: true,
  })
  .then((r) => console.log("response", r))
  .catch(console.error);
