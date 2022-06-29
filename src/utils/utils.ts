import BigNumber from 'bignumber.js';
export const to5 = (x: string) => new BigNumber(x).dp(5).toString();
export const bn = (x: string | number) => new BigNumber(x);
export function calcSlippage(amt: BigNumber, slippage: BigNumber, addSlip: boolean) {
  console.log('Before slippage', amt.toString());
  const slip = amt.times(slippage).div(100);
  const afterSlippage = addSlip ? amt.plus(slip) : amt.minus(slip);
  console.log(afterSlippage);
  return afterSlippage;
}
