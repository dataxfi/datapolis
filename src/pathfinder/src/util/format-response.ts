/**
 * Formats query responses into one standard object.
 * @param response
 * @returns IPoolNode[]
 */
export function formatter(response: any) {
  if (response.data?.errors) return;
  try {
    const {
      data: {
        data: { t0IsMatch, t1IsMatch },
      },
    } = response;

    const allData = [...t0IsMatch, ...t1IsMatch];

    const edges = new Set(allData.map((poolData) => poolData.id));

    return allData.map((pool) => ({
      poolAddress: pool.id,
      t1Address: pool.token0.id,
      t2Address: pool.token1.id,
      t1Liquidity: pool.totalValueLockedToken0,
      t2Liquidity: pool.totalValueLockedToken1,
      edges,
    }));
  } catch (error) {
    console.error(error);
  }
}
