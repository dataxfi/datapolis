import BigNumber from 'bignumber.js';
import React, { SetStateAction } from 'react';
import { IBtnProps } from '../@types/types';
export const to5 = (x: string) => new BigNumber(x).dp(5).toString();
export const bn = (x: string | number) => new BigNumber(x);

export function calcSlippage(amt: BigNumber, slippage: BigNumber, addSlip: boolean) {
  // console.log('Before slippage', amt.toString());
  const slip = amt.times(slippage).div(100);
  const afterSlippage = addSlip ? amt.plus(slip) : amt.minus(slip);
  // console.log(afterSlippage);
  return afterSlippage;
}

export const INITIAL_BUTTON_STATE = {
  text: 'Connect wallet',
  classes: '',
  disabled: false,
};

export class BtnManager {
  private setState: Function

  constructor(setState: React.Dispatch<React.SetStateAction<IBtnProps>>) {
    this.setState = setState;

  }

  public updateBtn(text?: string, disabled?: boolean, rest?: IBtnProps) {
    if (!rest) rest = INITIAL_BUTTON_STATE;
    if (text && disabled) {
      this.setState({
        ...rest,
        text,
        disabled,
      });
    } else {
      this.setState(rest);
    }
  }
}
