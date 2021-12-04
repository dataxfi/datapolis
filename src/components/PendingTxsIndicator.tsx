import React, { useContext } from "react"
import { RingLoader } from "react-spinners"
import { GlobalContext } from "../context/GlobalState"

export default function PendingTxsIndicator (){

    const {accountId, pendingTxs} = useContext(GlobalContext)

    console.log(accountId, pendingTxs)

    return  accountId && pendingTxs.length > 0 ? (
        <div className="block capitalize border border-type-500 text-type-200 rounded-md px-4 py-1 hm-box ">
          <div className="pr-3 flex flex-row">
            {`${pendingTxs.length} Pending`}{" "}
            <div className="pt-1 pl-1">
              <RingLoader size="20px" color="#f3c429" />
            </div>
          </div>{" "}
        </div>
      ) : null
}