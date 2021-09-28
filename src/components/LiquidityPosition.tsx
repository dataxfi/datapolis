import React, { useState } from 'react'
import { BsChevronDown, BsChevronUp } from 'react-icons/bs'
import Button from './Button'

const LiquidityPosition = () => {

    const [visible, setVisible] = useState(false);

    return (
        <div className="max-w-2xl mx-auto">
            <div onClick={() => setVisible(!visible)} className="flex justify-between p-4 rounded-t-lg bg-primary-700 select-none" role="button">
                <div className="grid grid-flow-col gap-2 items-center justify-start">
                    <img src="http://via.placeholder.com/40x40" className="rounded-lg" alt="" />
                    <img src="http://via.placeholder.com/40x40" className="rounded-lg" alt="" />
                    <p className="text-type-100 text-lg">
                        KNC/ETH
                    </p>
                </div>
                <div className="grid grid-flow-col gap-1 items-center">
                    <p className="text-type-200 text-sm">Manage</p>
                    {
                        visible ? 
                        <BsChevronDown size={14} /> :
                        <BsChevronUp size={14} />
                    }
                    
                </div>
            </div>
            {
                visible ? 
                <div className="p-4 bg-primary-800">
                <div className="p-4 bg-primary-900 rounded-lg">
                    <div className="grid grid-cols-2 justify-between">
                        <div>
                            <p className="text-type-300 text-sm">
                                Your total pool tokens
                            </p>
                        </div>
                        <div className="justify-self-end">
                            <p className="text-type-100 text-sm ">
                                1.414
                            </p>
                        </div>  
                        <div>
                            <p className="text-type-300 text-sm">
                                Pool tokens in rewards pool
                            </p>
                        </div>
                        <div className="justify-self-end">
                            <p className="text-type-100 text-sm ">
                                0
                            </p>
                        </div> 
                        <div>
                            <p className="text-type-300 text-sm">
                                Pooled KNC
                            </p>
                        </div>
                        <div className="justify-self-end">
                            <p className="text-type-100 text-sm ">
                                9.99999
                            </p>
                        </div>  
                        <div>
                            <p className="text-type-300 text-sm">
                                Pooled ETH
                            </p>
                        </div>
                        <div className="justify-self-end">
                            <p className="text-type-100 text-sm ">
                                0.199999
                            </p>
                        </div>          
                        <div>
                            <p className="text-type-300 text-sm">
                                Your pool share
                            </p>
                        </div>
                        <div className="justify-self-end">
                            <p className="text-type-100 text-sm ">
                                100%
                            </p>
                        </div>                                                                                                                 
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button text="Add" classes="bg-primary-600 hover:bg-primary-500 text-type-100 rounded-lg px-4 py-3" />
                    <Button text="Remove" classes="bg-primary-600 hover:bg-primary-500 text-type-100 rounded-lg px-4 py-3" />
                </div>
            </div> : <></>
            }

        </div>
    )
}

export default LiquidityPosition
