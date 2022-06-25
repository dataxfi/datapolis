import axios from "axios";
import { formatter } from "./format-response";
import { uniswapV2Query, uniswapV3Query } from "./subgraph-queries";

/**
 * Returns an axios response from the url provided.
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
export async function uniswapV2Req(url: string, address: string, amt: string) {
  try {
    const response = await axios.post(
      url,
      {
        query: uniswapV2Query(address, amt),
      },
      { timeout: 600000 }
    );
    console.info("Response for token" + address + ":" + response);
    return formatter(response);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Returns an axios response from the url provided.
 * @param address
 * @param amt - token amount to be swapped. Pools with less than are excluded
 */
export async function uniswapV3Req(url: string, address: string, amt: string) {
  try {
    const uniswap = await axios.post(
      url,
      {
        query: uniswapV3Query(address, amt),
      },
      { timeout: 600000 }
    );
    console.info("Response for token" + address + ":" + uniswap);
    return formatter(uniswap);
  } catch (error) {
    console.error(error);
  }
}
