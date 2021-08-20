import React from 'react'
import { BsCheckCircle, BsX } from 'react-icons/bs'

const TransactionDoneModal = () => {
    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md w-full z-20 shadow">
            <div className="bg-primary-900 rounded-lg p-4">
                <div className="flex justify-end">
                    <BsX size={28} className="text-type-200" />
                </div>

                <div className="mt-4 flex justify-center">
                    <BsCheckCircle size={56} className="text-blue-500" />
                </div>
                <div>
                    <p className="text-center text-type-100 text-lg">
                        Transaction submitted
                    </p>
                    <p className="text-blue-400 text-center mt-1">
                        View on explorer
                    </p>
                </div>
            </div>
        </div>
    )
}

export default TransactionDoneModal
