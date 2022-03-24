import { IToken } from "@dataxfi/datax.js";
import axios from "axios";
import { supportedChains } from "./types";
interface IUniswapResponse0 {
  id: string;
  token1: {
    id: string;
  };
  volumeToken0: string;
}

interface IUniswapResponse1 {
  id: string;
  token0: {
    id: string;
  };
  volumeToken1: string;
}

/**
 * pathfinder for swap transactions
 * @param chainId
 *
 */

export async function swapPathfinder(chainId: supportedChains, token1: IToken, token2: IToken) {
  if (!token1.info || !token2.info) return;
  let tokenInPools: any;
  let tokenOutPools: any;
  let path = [token1.info.address];

  switch (chainId) {
    case "4":
      //   token1Pools = await rinkebyPools(token1.info.address);
      //   token2Pools = await rinkebyPools(token2.info.address);
      break;
    case "137":
      tokenInPools = await maticPools(token1.info.address);
      tokenOutPools = await maticPools(token2.info.address, token2.value.plus(1).toString());
    case "56":
      tokenInPools = await bscPools(token1.info.address, token1.value.plus(1).toString());
      tokenOutPools = await bscPools(token2.info.address, token2.value.plus(1).toString());
      break;
    case "246":
      //   token1Pools = await energyWebPools(token1.info.address);
      //   token2Pools = await energyWebPools(token2.info.address);
      break;
    case "1285":
      tokenInPools = await moonriverPools(token1.info.address, token1.value.plus(1).toString());
      tokenOutPools = await moonriverPools(token2.info.address, token2.value.plus(1).toString());
      break;
    default:
      //default mainnet
      tokenInPools = await mainnetPools(token1.info.address, token1.value.plus(1).toString());
      tokenOutPools = await mainnetPools(token2.info.address, token2.value.plus(1).toString());
      break;
  }
}

interface IPoolNode {
  poolAddress: string;
  t1Address: string;
  t2Address: string;
  t1Liquidity: string;
  t2Liquidity: string;
  edges: string[];
}

class Pathfinder {
  private fetchFunction;
  private IN;
  private amt;
  private nodes: { [key: string]: IPoolNode };
  private tokenIn: IToken;
  private tokenOut: IToken;
  private leaves: IPoolNode[];
  private tokensChecked: Set<string>;
  public path;

  constructor({ fetchFunction, IN, amt, tokenIn, tokenOut }: { fetchFunction: Function; IN: boolean; amt: string; tokenIn: IToken; tokenOut: IToken }) {
    this.fetchFunction = fetchFunction;
    this.IN = IN;
    this.amt = amt;
    this.nodes = {};
    this.leaves = [];
    this.tokenIn = tokenIn;
    this.tokenOut = tokenOut;
    this.tokensChecked = new Set();

    if (!tokenIn.info?.address || !tokenOut.info?.address) return;
    this.path = IN ? this.getPath({ tokenAddress: tokenIn.info?.address }) : this.getPath({ tokenAddress: tokenOut.info?.address, amt });
  }

  private addPoolNode(poolNode: IPoolNode) {
    this.nodes[poolNode.poolAddress] = poolNode;
  }

  private async getAllPools({ tokenAddress, parentPoolAddress, amt }: { tokenAddress: string; parentPoolAddress?: string; amt?: string }) {
    if (this.tokensChecked.has(tokenAddress)) return;
    const nextTokensToSearch = [];
    if (this.IN) {
      this.leaves = await this.fetchFunction(tokenAddress);
    } else {
      this.leaves = await this.fetchFunction(tokenAddress, amt);
    }

    //iterate pools response adding nodes and edges
    for (let i = 0; i < this.leaves.length; i++) {
      const poolNode = this.leaves[i];
      if ((this.IN && poolNode.poolAddress === this.tokenOut.info?.address) || (!this.IN && poolNode.poolAddress === this.tokenIn.info?.address)) {
        //check if destination pool was found
        return null; //BFSPath
      }

      const nextTokenAddress = poolNode.t1Address === tokenAddress ? poolNode.t2Address : poolNode.t1Address;

      //since the destination pool was not found, the token needs to be swapped as it descends in the tree
      //calculate what amount of the next token would be needed from the next pool
      let nextAmt;
      if (!this.IN) nextAmt = ""; //calculateSwap()
      this.IN ? nextTokensToSearch.push([nextTokenAddress, poolNode.poolAddress]) : nextTokensToSearch.push([nextTokenAddress, poolNode.poolAddress, nextAmt]);
      //add node to tree
      if (this.IN) {
        let hasEnoughLiquidity;
        //todo: calculateSwap and check if there is enough liquidity
        // if (!hasEnoughLiquidity) break;
      }
      this.addPoolNode(poolNode);

      //add edge to parent
      this.tokensChecked.add(tokenAddress);
      if (parentPoolAddress) this.nodes[parentPoolAddress].edges.push(poolNode.poolAddress);
    }

    return nextTokensToSearch;
  }

  private async getPath({ tokenAddress, parentPoolAddress, amt }: { tokenAddress: string; parentPoolAddress?: string; amt?: string }) {
    let nextTokensToSearch;
    if (this.tokensChecked.size === 0) {
      if (this.IN) {
        nextTokensToSearch = await this.getAllPools({
          tokenAddress,
        });
      } else {
        nextTokensToSearch = await this.getAllPools({
          tokenAddress,
          amt,
        });
      }
    } else {
      if (this.IN) {
        nextTokensToSearch = await this.getAllPools({
          tokenAddress,
          parentPoolAddress,
        });
      } else {
        nextTokensToSearch = await this.getAllPools({
          tokenAddress,
          parentPoolAddress,
          amt,
        });
      }
    }

    if (!nextTokensToSearch) {
      return; //BFSPath
    }

    nextTokensToSearch.forEach((token) => {
      if (this.IN) {
        this.getPath({ tokenAddress: token[0], parentPoolAddress: token[1], amt: token[2] });
      } else {
        this.getPath({ tokenAddress: token[0], parentPoolAddress: token[1], amt: token[2] });
      }
    });
  }
}

//create a class
//fetch token in pools
//add all token in pool as seperate nodes

//token in and token out function
//create an array with:
//token in
//store this in a `descending` object
//create an array with
//token out
//store this path in an `ascending` object
//fetch pools for token in without a reserve amount
//fetch pools for token out with a reserve amount
//compare each pool address from token in pools with each address from token out pools
//if one of the pools match:
//unpack the descending to the left side of an array, unpack the ascending on the right
//return the path
//if none of the pools match:
//for each pool in the descending token:
//create a copy of the descending array, adding the new token address to the beginning
//for each pool in the ascending token:
//create a copy of the ascending array, adding the new token address to the end
//store these new arrays in the paths object
//call a new function with :
//the paths object
//

//prospective tokens for routing function
//
//
//create a variable to store the token addresses whos pools have already been fetched
//fetch all pools from the descending token
//fetch all pools from the ascending token
//add all token addresses from all queries to the variable in step 3
//collapse all arrays from ascending into one array
//collapse all arrays from descending into one array
//compare descending pools with ascending pools
//if there is a match, add descending token the left side of the middle of the path
//if there is a match, add ascending token to the right side of the middle of the path
//if there is not a match,

function intersection(setA: Set<string>, setB: Set<string>) {
  let _intersection = new Set();
  for (let elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  }
  return _intersection;
}

function formatter(address: string, balance: string, otherTokens: string[]) {
  return { address, balance, otherTokens };
}

/**
 * Returns set of all pools which contain provided address
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */

async function rinkebyPools(address: string) {}
/**
 * Returns set of all pools which contain provided address
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
async function energyWebPools(address: string) {}

/**
 * Returns set of all pools which contain provided address
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */

async function maticPools(address: string, amt?: string) {
  if (!amt) amt = "-1";
  const uniswap = await axios.post("https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon", {
    query: `query {
        a: pools(where:{token0_contains:"${address}", volumeToken0_gt:"${amt}"} ){
          id
          token1{
            id
            name
            symbol
          }
        }
        b: pools(where:{token1_contains:"${address}", volumeToken1_gt:"${amt}"} ){
          id
          token0{
            id
            name
            symbol
          }
        }
      }`,
  });

  //   const balancer = await axios.post("https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2", {
  //     query: `query{
  //         pools (where:{tokensList_contains:["${address}"]}){
  //           tokens{
  //             address
  //             balance
  //           }
  //         }
  //       }`,
  //   });

  //   const poolsWEnoughLiquidity = balancer.data.pools
  //     .filter((pool: { tokens: any[] }) => pool.tokens.find((token) => token.address === address && Number(token.balance) > Number(amt)))
  //     .map((pool: any) =>
  //       formatter(
  //         pool.address,
  //         pool.tokens.find((token:any) => token.address === address)
  //       )
  //     );

  // const formattedUniswapPools = uniswap.map((pool)=>{formatter<...>})

  const allResults = [...uniswap.data.a, ...uniswap.data.b];
  const poolsOnly = new Set(allResults.map((pool) => pool.id));
  return [allResults, poolsOnly];
}
/**
 * Returns set of all pools which contain provided address
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
async function mainnetPools(address: string, amt: string) {
  const uniswap = await axios.post("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3", {
    query: `query {
            a: pools(where:{token0_contains:"${address}", volumeToken0_gt:"${amt}"} ){
              id
              token0{
                id
                name
                symbol
              }
              token1{
                id
                name
                symbol
              }
            volumeToken0, 
            volumeToken1
            }
            
            b: pools(where:{token1_contains:"${address}", volumeToken0_gt:"${amt}"} ){
              id
              token0{
                id
                name
                symbol
              }
              token1{
                id
                name
                symbol
              }
                volumeToken0, 
            volumeToken1
            }
          }`,
  });

  const balancer = axios.post("https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2", {
    query: `query{
        pools (where:{tokensList_contains:["${address}"]}){
            address
          tokens{
            address
            balance
          }
        }
      }`,
  });
}
/**
 * Returns set of all pools which contain provided address
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
async function bscPools(address: string, amt: string) {
  const pancake = axios.post("https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2", {
    query: `query{
        t0isOcean: pairs(where:{token0_contains:"${address}"}){
          id
          token1{
            symbol
          }
        }
        
        t1isOcean: pairs(where:{token1_contains:"${address}"}){
          id
          token0{
            symbol
          }
        }
      }
      
      `,
  });
}
/**
 * Returns set of all pools which contain provided address
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
async function moonriverPools(address: string, amt: string) {
  const solarbeam = await axios.post("https://api.thegraph.com/subgraphs/name/solarbeamio/amm-v2", {
    query: `query {
        t0isOcean: pairs(where:{token0_contains:"${address}"}){
          token1{
            name
          }
        }
        
        t1isOcean: pairs(where:{token1_contains:"${address}"}){
          token0{
            name
          }
        }
      }`,
  });
}
