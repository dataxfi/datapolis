import { IToken } from "@dataxfi/datax.js";
import axios from "axios";
import { supportedChains } from "./types";

/**
 * pathfinder for swap transactions
 * @param chainId
 *
 */

export async function swapPathfinder(chainId: supportedChains, token1: IToken, token2: IToken) {
  if (!token1.info || !token2.info) return;
  let token1Pools: any;
  let token2Pools: any;
  switch (chainId) {
    case "4":
      token1Pools = await rinkebyPools(token1.info.address);
      token2Pools = await rinkebyPools(token2.info.address);
      break;
    case "137":
      token1Pools = await maticPools(token1.info.address);
      token2Pools = await maticPools(token2.info.address);
      break;
    case "56":
      token1Pools = await bscPools(token1.info.address);
      token2Pools = await bscPools(token2.info.address);
      break;
    case "246":
      token1Pools = await energyWebPools(token1.info.address);
      token2Pools = await energyWebPools(token2.info.address);
      break;
    case "1285":
      token1Pools = await moonriverPools(token1.info.address);
      token2Pools = await moonriverPools(token2.info.address);
      break;
    default:
      //default mainnet
      token1Pools = await mainnetPools(token1.info.address);
      token2Pools = await mainnetPools(token2.info.address);
      break;
  }
}

async function rinkebyPools(address: string) {}

async function energyWebPools(address: string) {}

async function maticPools(address: string) {
  const uniswap = await axios.post("https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon", {
    query: `query {
        a: pools(where:{token0_contains:"${address}"} ){
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
        
        b: pools(where:{token1_contains:"${address}"} ){
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

  const balancer = await axios.post("https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2", {
    query: `query{
        pools (where:{tokensList_contains:["${address}"]}){
          tokens{
            symbol
            name
          }
          tokensList
          baseToken
        }
      }`,
  });
}

async function mainnetPools(address: string) {
  const uniswap = await axios.post("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3", {
    query: `query {
            a: pools(where:{token0_contains:"${address}"} ){
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
            
            b: pools(where:{token1_contains:"${address}"} ){
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
              tokens{
                symbol
                name
              }
              tokensList
              baseToken
            }
          }`,
  });
}

async function bscPools(address: string) {
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

async function moonriverPools(address: string) {
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
