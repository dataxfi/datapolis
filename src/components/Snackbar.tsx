import React from 'react'
import { BsCheckCircle, BsX } from 'react-icons/bs'

const Snackbar = ({text, onClose}: {text: string, onClose: Function}) => {
    return (
        <div className="max-w-xs fixed md:top-8 md:right-8 w-full mx-auto bg-primary-800 rounded-lg p-4">
            <div className="flex justify-between items-start">
                <div className="grid grid-flow-col gap-4 items-center">
                    <BsCheckCircle size="24" className="text-green-400" />
                    <div>
                        <p className="text-type-100 text-sm">{text}</p>
                        <p className="text-type-300 text-sm">View on explorer</p>
                    </div>
                </div>
                <div>
                    <BsX role="button" color="white" onClick={() => { onClose() }} />
                </div>
            </div>
        </div>
    )
}

export default Snackbar
