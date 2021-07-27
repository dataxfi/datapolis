import SwapInput from "./SwapInput"
import { IoSwapVertical } from "react-icons/io5"
import {MdLocalGasStation, MdTune} from 'react-icons/md'
import Button from "./Button"

const text = {
    T_SWAP: 'Swap',
    T_SWAP_FROM: 'Swap from',
    T_SWAP_TO: 'Swap to'
}


const Swap = () => {

    function handleWalletConnection(){

    }

    return (
        <div className="flex mt-16 w-full items-center">
            <div className="max-w-2xl mx-auto bg-black w-full rounded-lg p-4">
                <div className="flex justify-between">
                    <p className="text-xl">Swap</p>
                    <div className="grid grid-flow-col gap-2 items-center">
                        <div role="button" className="grid grid-flow-col items-center gap-1 hover:bg-gray-900 rounded-lg px-2 py-1.5">
                            <MdLocalGasStation size="24" style={{color: '#7CFF6B'}} />
                            <p className="text-green-500">20</p>
                        </div>
                        <div className="hover:bg-gray-900 px-1.5 py-1.5 rounded-lg" role="button">
                            <MdTune role="button" size="24" />
                        </div>
                    </div>
                </div>
                <SwapInput title={text.T_SWAP_FROM} />
                <div className="px-4 relative my-12">
                    <div role="button" tabIndex={0} className="rounded-full border-black border-4 absolute -top-14 bg-gray-800 w-16 h-16 flex items-center justify-center">
                        <IoSwapVertical size="30" color="#ccc" />
                    </div>
                </div>
                <SwapInput title={text.T_SWAP_TO} />
                <div className="mt-4">
                    <Button classes="px-4 py-4 rounded-lg bg-blue-500 bg-opacity-20 hover:bg-opacity-40 w-full text-blue-400" text="Connect to a wallet" onClick={handleWalletConnection} />
                </div>
            </div>
        </div>
    )
}

export default Swap
