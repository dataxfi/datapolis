import { BsCheckCircle, BsX } from "react-icons/bs"

const TransactionDoneModal = ({
  show,
  txHash,
  close
}: {
  show: boolean
  txHash: string
  close: Function
}) => {
  if (!show) return null
  return (
    <div id="transactionDoneModal" className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:max-w-sm w-full z-20 shadow">
      <div className="bg-primary-900 border rounded-lg pb-8 p-4 hm-box mx-3">
        <div className="flex justify-end">
          <BsX
          id="transactionDoneModalCloseBtn"
            onClick={() => close()}
            size={28}
            className="text-type-200"
            role="button"
          />
        </div>

        <div className="mt-4 flex justify-center">
          <BsCheckCircle size={56} className="text-green-400" />
        </div>
        <div>
          <p className="text-center text-type-100 text-lg">
            Transaction Processed
          </p>
          <p className="text-blue-400 text-center mt-1">
            <a id="transactionLink" target="_blank" rel="noreferrer" className="text-green-400" href={txHash}>
              View on explorer
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default TransactionDoneModal
