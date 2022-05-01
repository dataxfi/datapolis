import DataXFold from '../assets/DataX-X-Fold.gif';

function Loader({ size }: { size: number }) {
  return (
    <div>
      <img src={DataXFold} alt="dataX loading animation" width={`${size}px`} />
    </div>
  );
}

export default Loader;
