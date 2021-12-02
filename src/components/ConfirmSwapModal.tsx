import React from 'react'
import { BsArrowDown, BsShuffle, BsX } from 'react-icons/bs'
import Button from './Button'
import { useContext, useEffect, useState } from 'react'
import ConfirmSwapItem from './ConfirmSwapItem'
import ConfirmSwapListItem from './ConfirmSwapListItem'
import {GlobalContext} from '../context/GlobalState'
import { toFixed } from '../utils/equate'

const ConfirmSwapModal = ({confirm, show, close, token1, token2, postExchange, slippage} : {confirm: Function, show: boolean, close: Function, token1: any, token2: any, postExchange: any, slippage: number | string}) => {

    const {ocean} = useContext(GlobalContext)
    const [swapFee, setswapFee] = useState(0);
    const [minReceived, setMinReceived] = useState(0)

    useEffect(() => {
        if(show){
            const exchange = token2.value || 0
            setMinReceived(exchange - (exchange * Number(slippage || 1)/100))
        }
            // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token2.value, slippage, show]);

    useEffect(() => {
        if(show){
            if(ocean && token1.info && token1.value && token2.info){
                (async () => {
                    const pool = token1.info.symbol === 'OCEAN' ? token2.info.pool : token1.info.pool
                    const swapFee = await ocean.calculateSwapFee(pool, token1.value)
                    setswapFee(swapFee)
                 })()
            }
        }
    });

    if(!show){
        return null
    }
    else return (
        <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:max-w-md w-full z-30 shadow ${show ? 'block':'hidden'}`}>
            <div className="py-8 px-4 md:px-8 bg-primary-900 border rounded-lg hm-box mx-3 md:mx-auto">
                <div className="flex justify-between items-center">
                    <p className="text-type-300 text-xl">Confirm swap</p>
                    <BsX onClick={() => close()} role="button" size={28} />
                </div>

                <div className="mt-4">
                    <ConfirmSwapItem img={token1.info.logoURI} value={token1.value} name={token1.info.symbol} />
                    <BsArrowDown className="ml-2 my-2 text-type-300" size={24} />
                    <ConfirmSwapItem img={token2.info.logoURI} value={token2.value} name={token2.info.symbol} />
                </div>

                <div className="mt-6 flex justify-between">
                    <p className="text-type-400 text-sm">
                        Exchange rate
                    </p>
                    <p className="text-type-400 text-sm grid grid-flow-col items-center gap-2">
                        1 {token1?.symbol} = {toFixed(postExchange)} {token2.info.symbol}
                        <BsShuffle size={12} />
                    </p>
                </div>

                <div className="mt-4">
                    {/* <ConfirmSwapListItem name="Route" value="ETH > KNC" /> */}
                    <ConfirmSwapListItem name="Minimum received" value={toFixed(minReceived)} />
                    {/* <ConfirmSwapListItem name="Price impact" value="-0.62%" valueClass="text-green-500" /> */}
                    <ConfirmSwapListItem name="Swap fee" value={swapFee.toString() + " " + token1.info.symbol} />
                    <ConfirmSwapListItem name="TradeX fee" value="0" />
                    {/* <ConfirmSwapListItem name="DataX fee" value="0.000000006 ETH" /> */}
                    <ConfirmSwapListItem name="Slippage tolerance" value={slippage + "%"} />
                </div>

                <div className="mt-4">
                    <p className="text-type-300 text-sm">
                        You will receive at least {toFixed(minReceived)} {token2.info.symbol} or the transaction will revert.
                    </p>
                </div>

                <div className="mt-4">
                    <Button onClick={() => {confirm()}} text="Confirm swap" classes="px-4 py-2 text-lg text-type-100 w-full border rounded-lg" />
                </div>

            </div>
        </div>
    )
}

export default ConfirmSwapModal
