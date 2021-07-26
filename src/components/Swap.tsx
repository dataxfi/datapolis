import SwapInput from "./SwapInput"

const text = {
    T_SWAP: 'Swap',
    T_SWAP_FROM: 'Swap from',
    T_SWAP_TO: 'Swap to'
}


const Swap = () => {
    return (
        <div className="flex mt-32 w-full items-center">
            <div className="max-w-3xl mx-auto bg-black w-full rounded-lg p-4">
                <p className="text-xl">Swap</p>
                <SwapInput title={text.T_SWAP_FROM} />
                <SwapInput title={text.T_SWAP_TO} />
            </div>
        </div>
    )
}

export default Swap
