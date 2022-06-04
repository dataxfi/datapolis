import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';

export default function ViewDescBtn() {
  const { setShowDescModal, tokenOut, showDescModal } = useContext(GlobalContext);
  return (
    <button
      id="viewDescButton"
      disabled={!tokenOut.info?.pool}
      className={` text-gray-300 ${tokenOut.info?.pool ? 'hover:text-white' : ''}  disabled:cursor-not-allowed`}
      onClick={() => setShowDescModal(!showDescModal)}
    >
      {'<'} Dataset Description
    </button>
  );
}
