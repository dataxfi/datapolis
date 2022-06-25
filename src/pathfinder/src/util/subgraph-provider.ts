import { formatter } from "./format-response";
import { uniswapV2Req, uniswapV3Req } from "./subgraph-requests";
import rinkeby from "./rinkeby.json";

/**
 * Returns set of all pools which contain provided address from Energyweb chain (246)
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
export async function energywebPools(address: string, amt: string = "0.001") {
  return uniswapV3Req("https://ewc-subgraph-production.carbonswap.exchange/subgraphs/name/carbonswap/uniswapv2", address, amt);
}

/**
 * Returns set of all pools which contain provided address from matic chain (137)
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */

export async function maticPools(address: string, amt: string = "0.001") {
  return uniswapV2Req("https://polygon.furadao.org/subgraphs/name/quickswap", address, amt);
}
/**
 * Returns set of all pools which contain provided address from mainnet (1)
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
export async function mainnetPools(address: string, amt: string = "0.001") {
  return uniswapV2Req("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2", address, amt);
}

/**
 * Returns set of all pools which contain provided address from bsc chain (56)
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
export async function bscPools(address: string, amt: string = "0.001") {
  return uniswapV3Req("https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2", address, amt);
}

/**
 * Returns set of all pools which contain provided address from moonriver chain (1285)
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
export async function moonriverPools(address: string, amt: string = "0.001") {
  return uniswapV3Req("https://api.thegraph.com/subgraphs/name/solarbeamio/amm-v2", address, amt);
}

/**
 * Returns set of all pools which contain provided address
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */

export async function rinkebyPools(address: string, amt: string = ".001") {
  return uniswapV3Req("https://api.thegraph.com/subgraphs/name/mtahon/uniswap-v3-rinkeby", address, amt);
}
