import React from "react"
import { BsArrowDown } from "react-icons/bs"
import Button from "./Button"

const RemoveAmount = () => {
  const updateNum = (val: string) => {
    console.log("Remove percentage")
  }

  return (
    <div className="flex mt-16 w-full items-center mb-20">
      <div className="max-w-2xl mx-auto bg-primary-900 w-full rounded-lg p-4 hm-box">
        <div className="md:grid md:grid-cols-5 bg-primary-800 p-4">
          <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center">
            <p className="text-type-100">Amount to remove</p>
          </div>
          <div className="col-span-3 flex justify-end mt-3 md:mt-0 bg-primary-900 rounded-lg p-2">
            <div>
              {/* https://stackoverflow.com/a/58097342/6513036 and https://stackoverflow.com/a/62275278/6513036 */}
              <input
                onChange={e => updateNum(e.target.value)}
                onWheel={event => event.currentTarget.blur()}
                onKeyDown={evt =>
                  ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()
                }
                type="number"
                className="h-full w-full rounded-lg bg-primary-900 text-2xl px-2 outline-none focus:placeholder-type-200 placeholder-type-400 text-right"
                placeholder="0.0"
              />
            </div>
            <p className="text-type-300 text-2xl">%</p>
          </div>
        </div>
        <div className="px-4 relative my-12">
          <div className="rounded-full border-primary-900 border-4 absolute -top-14 bg-primary-800 w-16 h-16 flex items-center justify-center swap-center">
            <BsArrowDown size="30" className="text-gray-300" />
          </div>
        </div>
        <div className="bg-primary-800 p-4">
          <div className="md:grid md:grid-cols-5 bg-primary-800 p-4">
            <div className="col-span-2">
              <p className="text-type-100">You will receive</p>
            </div>
            <div className="col-span-3 grid grid-cols-2 gap-4">
              <div className="bg-primary-900 grid grid-flow-col gap-2 p-2 rounded-lg">
                <div>
                  <img
                    src="http://via.placeholder.com/80x80"
                    className="w-12 rounded-lg"
                    alt=""
                  />
                </div>
                <div>
                  <p className="text-type-100">0.795054</p>
                  <p className="text-xs text-type-100">KNC</p>
                </div>
              </div>
              <div className="bg-primary-900 grid grid-flow-col gap-2 p-2 rounded-lg">
                <div>
                  <img
                    src="http://via.placeholder.com/80x80"
                    className="w-12 rounded-lg"
                    alt=""
                  />
                </div>
                <div>
                  <p className="text-type-100">0.016532</p>
                  <p className="text-xs text-type-100">ETH</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* <div className="bg-gradient"></div> */}
          <Button
            text="Approve"
            classes="w-full px-8 py-4 border border-primary-500 rounded-lg"
          ></Button>
          <Button
            text="Confirm withdrawal"
            classes="w-full px-8 py-4 border border-primary-500 rounded-lg"
          ></Button>
        </div>
      </div>
    </div>
  )
}

export default RemoveAmount
