import BigNumber from 'bignumber.js'
export const to5 = (x: string) => new BigNumber(x).dp(5).toString();
