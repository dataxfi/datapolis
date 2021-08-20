import React from 'react'
import { BsX } from 'react-icons/bs'
import HashLoader from 'react-spinners/HashLoader'

const ConfirmModal = () => {
    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md w-full z-30 shadow">
            <div className="bg-primary-900 p-4 rounded-lg">
                <div className="flex justify-end">
                    <BsX role="button" size="28" className="text-type-200 text-right" />
                </div>
                <div className="flex items-center justify-center">
                    <HashLoader size={48} color="white" loading={true} />
                </div>
                <div className="text-center">
                    <p className="text-type-100 text-lg mt-2">
                            Waiting for confirmation
                    </p>
                    <p className="text-type-200 mt-2">
                        Supplying 0.3 ETH and 300 LINK
                    </p>
                    <p className="mt-8 text-type-400 text-sm">
                        Confirm this transaction in your wallet
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal
