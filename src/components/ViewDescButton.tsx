import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { getDID } from './DTDescriptionModal';

export default function ViewDescBtn() {
  const { setShowDescModal, token2, setT2DIDResponse, showDescModal } = useContext(GlobalContext);
  return (
    <button
      id="viewDescButton"
      disabled={token2.info ? false : true}
      className={` text-gray-300 ${token2.info ? 'hover:text-white' : ''}  disabled:cursor-not-allowed`}
      onClick={() => setShowDescModal(!showDescModal)}
    >
      {'<'} Dataset Description
    </button>
  );
}
