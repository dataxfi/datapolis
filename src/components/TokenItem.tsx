import { TokenInfo } from "@dataxfi/datax.js/dist/TokenList"

const TokenItem = ({token, onClick}: {token: TokenInfo, onClick: Function}) => {
    return (
        <div id={`${token.symbol}-btn`} onClick={() => onClick(token)} className="px-2 py-1.5 hover:bg-gray-200 hover:bg-opacity-20 rounded-lg cursor-pointer">
            <div className="grid grid-flow-col justify-start gap-2 items-center">
                <div>
                    <img src={token.logoURI} className="rounded-lg w-8 h-8" alt="" loading="lazy" />
                </div>
                <div>
                    <p className="text-lg text-gray-100">{token.symbol}</p>
                    <p className="text-sm text-gray-200">{token.name}</p>
                </div>
            </div>
        </div>
    )
}

export default TokenItem
