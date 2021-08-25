import React from 'react'

const ConfirmSwapListItem = ({name, value, valueClass}: {name: string, value: string, valueClass?: string}) => {
    return (
        <div className="flex justify-between mt-2">
            <div>
                <p className="text-type-300 text-sm">{name}</p>
            </div>
            <div>
                <p className={"text-sm " + (valueClass ? valueClass:"text-type-100")}>{value}</p>
            </div>
        </div>
    )
}

export default ConfirmSwapListItem
