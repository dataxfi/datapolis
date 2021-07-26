import SwapInput from "./SwapInput"

const Swap = () => {
    return (
        <div className="flex mt-32 w-full items-center">
            <div className="max-w-3xl mx-auto bg-black w-full rounded-lg p-4">
                <p className="text-xl">Swap</p>
                <SwapInput />
                <SwapInput />
            </div>
        </div>
    )
}

export default Swap
