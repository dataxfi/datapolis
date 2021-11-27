import YellowXLoader from '../assets/YellowXLoader.gif'

function Loader ({size}:{size:number}){
    return (
        <div>
            <img src={YellowXLoader} alt="dataX loading animation" width={`${size}px`} />
        </div>
    )
}

export default Loader