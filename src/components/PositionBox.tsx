import React from 'react'

const PositionBox = () => {
    return (
        <div>
            <div className="p-4 bg-primary-800 rounded-lg max-w-2xl mx-auto">
                <p className="text-type-100 text-lg">Your position</p>
                <div className="flex justify-between mt-4 items-center">
                    <div className="grid grid-flow-col gap-4 items-center">
                        <img src="http://via.placeholder.com/80x80" className="w-10 h-10 rounded-lg" alt="" />
                        <img src="http://via.placeholder.com/80x80" className="w-10 h-10 rounded-lg" alt="" />
                        <p className="text-xl">KNC/ETH</p>
                    </div>
                    <div>
                        <p className="text-type-100 text-sm">1.311 <span className="text-type-400">Pool tokens</span> </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 justify-between bg-primary-900 rounded-lg p-4 mt-6">
                    <div>
                        <p className="text-type-100 text-sm">Your pool share</p>
                    </div>
                    <div className="justify-self-end">
                        <p className="text-type-100 text-sm">100.0000000%</p>
                    </div>
                    <div>
                        <p className="text-type-100 text-sm">KNC</p>
                    </div>
                    <div className="justify-self-end">
                        <p className="text-type-100 text-sm">7.96503 <span className="text-type-400">KNC</span></p>
                    </div>
                    <div>
                        <p className="text-type-100 text-sm">ETH</p>
                    </div>
                    <div className="justify-self-end">
                        <p className="text-type-100 text-sm">0.16099 <span className="text-type-400">ETH</span></p>
                    </div>                                        
                </div>
            </div>
        </div>
    )
}

export default PositionBox
