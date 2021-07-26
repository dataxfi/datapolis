import React from 'react'

const SwapInput = () => {
    return (
        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
        <div className="grid grid-cols-5">
            <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center">
                <img src="http://via.placeholder.com/70x70" className="w-16 h-16 rounded-md" alt="" />
                <div>
                    <p className="text-xs text-gray-300">Swap from</p>
                    <p className="text-2xl text-gray-200 font-bold">ETH</p>
                </div>
            </div>
            <div className="col-span-3">
                {/* https://stackoverflow.com/a/58097342/6513036 */}
                <input onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()} type="number" className="h-full w-full rounded-lg bg-black text-4xl px-2 outline-none focus:placeholder-gray-200 placeholder-gray-500" placeholder="0.0" />
            </div>
        </div>
    </div>
    )
}

export default SwapInput
