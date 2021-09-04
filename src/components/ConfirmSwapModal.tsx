import React from 'react'
import { BsArrowDown, BsShuffle, BsX } from 'react-icons/bs'
import Button from './Button'
import { useContext, useEffect, useState } from 'react'
import ConfirmSwapItem from './ConfirmSwapItem'
import ConfirmSwapListItem from './ConfirmSwapListItem'
import {GlobalContext} from '../context/GlobalState'

const ConfirmSwapModal = ({confirm, show, close} : {confirm: Function, show: boolean, close: Function}) => {

    const {token1, token2, token1Value, token2Value, postExchange, ocean, slippage} = useContext(GlobalContext)

    const [swapFee, setswapFee] = useState(0);
    const [minReceived, setMinReceived] = useState(0)

    useEffect(() => {
        const exchange = token2Value || 0
        setMinReceived(exchange - (exchange * slippage/100))
    }, [token2Value, slippage]);

    useEffect(() => {
        if(ocean && token1 && token1Value){
            (async () => {
                const pool = token1.symbol === 'OCEAN' ? token2.pool : token1.pool
                const swapFee = await ocean.calculateSwapFee(pool, token1Value)
                setswapFee(swapFee)
             })()
        }
    });

    if(!show){
        return null
    }
    else return (
        <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-sm w-full z-30 shadow ${show ? 'block':'hidden'}`}>
            <div className="p-4 bg-primary-900 rounded-lg hm-box">
                <div className="flex justify-between items-center">
                    <p className="text-type-300 text-xl">Confirm swap</p>
                    <BsX onClick={() => close()} role="button" size={28} />
                </div>

                <div className="mt-4">
                    <ConfirmSwapItem img={token1.logoURI} value={token1Value} name={token1?.symbol} />
                    <BsArrowDown className="ml-2 my-2 text-type-300" size={24} />
                    <ConfirmSwapItem img={token2.logoURI} value={token2Value} name={token2?.symbol} />
                </div>

                <div className="mt-6 flex justify-between">
                    <p className="text-type-400 text-sm">
                        Exchange rate
                    </p>
                    <p className="text-type-400 text-sm grid grid-flow-col items-center gap-2">
                        1 {token1?.symbol} = {postExchange.toFixed(6)} {token2?.symbol}
                        <BsShuffle size={12} />
                    </p>
                </div>

                <div className="mt-4">
                    {/* <ConfirmSwapListItem name="Route" value="ETH > KNC" /> */}
                    <ConfirmSwapListItem name="Minimum received" value={minReceived.toFixed(6)} />
                    {/* <ConfirmSwapListItem name="Price impact" value="-0.62%" valueClass="text-green-500" /> */}
                    <ConfirmSwapListItem name="Swap fee" value={swapFee.toString() + " " + token1.symbol} />
                    {/* <ConfirmSwapListItem name="DataX fee" value="0.000000006 ETH" /> */}
                    <ConfirmSwapListItem name="Slippage tolerance" value={slippage + "%"} />
                </div>

                <div className="mt-4">
                    <p className="text-type-300 text-sm">
                        Output is estimated. You will receive at least {minReceived.toFixed(6)} {token2.symbol} or the transaction will revert
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
