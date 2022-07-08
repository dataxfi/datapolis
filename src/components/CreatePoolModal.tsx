import { BsX } from 'react-icons/bs';
import Button from './Button';

const CreatePoolModal = () => {
  return (
    <div className="fixed center sm:max-w-sm w-full z-20 shadow">
      <div className="bg-primary-900 p-4 rounded-t-lg hm-box mx-3">
        <div className="flex justify-between items-start">
          <p className="text-gray-200 text-xl">You are creating a pool</p>
          <BsX className="text-gray-200" size="28" />
        </div>
        <div>
          <div className="grid grid-flow-col gap-2 justify-start items-center mt-4">
            <p className="text-gray-100 text-xl">ETH/LINK</p>
            <img src="http://via.placeholder.com/40x40" alt="" className="rounded-lg" />
            <img src="http://via.placeholder.com/40x40" alt="" className="rounded-lg" />
          </div>
        </div>
      </div>
      <div className="w-full bg-primary-800 p-4 rounded-b-lg">
        <div className="grid justify-between text-sm grid-flow-col">
          <p className="text-gray-200">Rates</p>
          <div>
            <p className="text-gray-100">1 ETH = 1000 LINK</p>
            <p className="text-gray-100">1 LINK = 0.001 ETH</p>
          </div>
        </div>
        <hr className="my-4" />
        <div className="grid grid-cols-2 justify-between">
          <div>
            <p className="text-gray-400">ETH deposited</p>
          </div>
          <div className="justify-self-end">
            <p className="text-gray-100">0.3 ETH</p>
          </div>
          <div>
            <p className="text-gray-400">LINK deposited</p>
          </div>
          <div className="justify-self-end">
            <p className="text-gray-100">300 LINK</p>
          </div>
          <div>
            <p className="text-gray-400">Share of pool</p>
          </div>
          <div className="justify-self-end">
            <p className="text-gray-100">100%</p>
          </div>
        </div>
        <Button classes="px-4 py-4 w-full mt-4 mb-2 bg-primary-700 rounded-lg" text="Create pool &amp; supply" />
      </div>
    </div>
  );
};

export default CreatePoolModal;
