import React from 'react'
import { BsArrowDown, BsShuffle, BsX } from 'react-icons/bs'
import Button from './Button'
import ConfirmSwapItem from './ConfirmSwapItem'
import ConfirmSwapListItem from './ConfirmSwapListItem'

const ConfirmSwapModal = () => {
    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md w-full z-30 shadow">
            <div className="p-4 bg-primary-900 rounded-lg">
                <div className="flex justify-between items-center">
                    <p className="text-type-300 text-xl">Confirm swap</p>
                    <BsX role="button" size={28} />
                </div>

                <div className="mt-4">
                    <ConfirmSwapItem img="http://via.placeholder.com/48x48" value="0.001" name="ETH" />
                    <BsArrowDown className="ml-2 my-2 text-type-300" size={24} />
                    <ConfirmSwapItem img="http://via.placeholder.com/48x48" value="0.04952412" name="KNC" />
                </div>

                <div className="mt-6 flex justify-between">
                    <p className="text-type-400 text-sm">
                        Exchange rate
                    </p>
                    <p className="text-type-400 text-sm grid grid-flow-col items-center gap-2">
                        1 KNC = 0.02019 ETH
                        <BsShuffle size={12} />
                    </p>
                </div>

                <div className="mt-4">
                    <ConfirmSwapListItem name="Route" value="ETH > KNC" />
                    <ConfirmSwapListItem name="Minimum received" value="0.0492948" />
                    <ConfirmSwapListItem name="Price impact" value="-0.62%" valueClass="text-green-500" />
                    <ConfirmSwapListItem name="Liquidity provider fee" value="0.000000025 ETH" />
                    <ConfirmSwapListItem name="DataX fee" value="0.000000006 ETH" />
                    <ConfirmSwapListItem name="Slippage tolerance" value="0.50%" />
                </div>

                <div className="mt-4">
                    <p className="text-type-300 text-sm">
                        Output is estimated. You will receive at least 0.0049673 KNC or the transaction will revert
                    </p>
                </div>

                <div className="mt-4">
                    <Button text="Confirm swap" classes="px-4 py-2 text-lg text-type-100 w-full border rounded-lg" />
                </div>

            </div>
        </div>
    )
}

export default ConfirmSwapModal
