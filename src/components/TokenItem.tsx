const TokenItem = ({token, onClick}: {token: Record<any, any>, onClick: Function}) => {
    return (
        <div onClick={() => onClick(token)} className="px-2 py-1.5 hover:bg-type-200 hover:bg-opacity-20 rounded-lg cursor-pointer">
            <div className="grid grid-flow-col justify-start gap-2 items-center">
                <div>
                    <img src={token.logoURI} className="rounded-lg w-8 h-8" alt="" loading="lazy" />
                </div>
                <div>
                    <p className="text-lg text-type-100">{token.symbol}</p>
                    <p className="text-sm text-type-200">{token.name}</p>
                </div>
            </div>
        </div>
    )
}

export default TokenItem
