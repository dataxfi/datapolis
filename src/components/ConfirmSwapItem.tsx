const ConfirmSwapItem = ({img, value, name}: {img: string, value: string, name: string }) => {
    return (
        <div className="flex justify-between items-center">
            <div className="grid grid-flow-col items-center gap-4 justify-start">
                <img src={img} className="rounded-lg w-10" alt="" />
                <p className="text-gray-100 text-lg">{value}</p>
            </div>
            <p id={`confirmSwapItem${name}`} className="justify-self-end text-gray-100 text-lg pr-2">
                    {name}
            </p>            
        </div>
    )
}

export default ConfirmSwapItem
