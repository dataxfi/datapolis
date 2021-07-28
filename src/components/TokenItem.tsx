import React from 'react'

const TokenItem = ({token}: {token: Record<any, any>}) => {
    return (
        <div className="px-2 py-1.5 hover:bg-type-200 hover:bg-opacity-20 rounded-lg cursor-pointer">
            <div className="grid grid-flow-col justify-start gap-2 items-center">
                <div>
                    <img src="http://via.placeholder.com/36x36" className="rounded-lg" alt="" />
                </div>
                <div>
                    <p className="text-lg text-type-100">{token.symbol}</p>
                    <p className="text-sm text-type-200">{token.name}</p>
                </div>
            </div>
        </div>
    )
}

export default TokenItem
