import React from 'react'
import { MdClose } from 'react-icons/md'
import TokenItem from './TokenItem'

const text = {
    T_SELECT_TOKEN: 'Select a token'
}

const TokenModal = ({close}: {close: Function}) => {

    const tokens = [
        {name: 'Stox', symbol: 'STX'},
        {name: 'Mathtoken', symbol: 'MATH'},
        {name: 'STAKE', symbol: 'STAKE'},
        {name: 'TellorTributes', symbol: 'TRB'},
        {name: 'yearn.finance', symbol: 'YFI'},
        {name: 'Abyss', symbol: 'ABYSS'},
        {name: 'Mana', symbol: 'MANA'},
        {name: 'GRID', symbol: 'GRID'},
        {name: 'uDOO', symbol: 'uDOO'}
    ]

    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md w-full">
                <div className="p-4 bg-background border-primary-500 border w-full rounded-lg">
                    <div className="flex justify-between items-center">
                        <p className="mb-0 text-type-100 text-2xl">{text.T_SELECT_TOKEN}</p>
                        <MdClose role="button" onClick={() => {close()}} className="text-type-100 text-2xl" />
                    </div>
                    <div className="mt-4">
                        <input type="text" placeholder="Search token" className="px-4 py-2 h-full w-full rounded-lg bg-primary-900 text-base outline-none focus:placeholder-type-200 placeholder-type-400" />    
                    </div>
                    <div className="mt-4 overflow-y-scroll" style={{maxHeight: '60vh'}}>
                        {tokens.map((t, idx) =>{ 
                            return (
                                <TokenItem key={idx} token={t} />
                            )
                        }
                        )}
                     </div>
                </div>
            {/* </div> */}
        </div>
    )
}

export default TokenModal
