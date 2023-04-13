import { useEffect, useState, useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import SocialLinkIcons from './SocialLinkIcons';
import BuiltWDataX from './BuiltWDataX';

export default function Footer() {
  const { web3, location } = useContext(GlobalContext);

  
  // console.log(web3);
  const [blockNo, setBlockNo] = useState(0);

  useEffect(() => {
    async function getBlockNumber() {
      if (web3) setBlockNo(await web3.eth.getBlockNumber());
    }
    getBlockNumber();
  }, [web3]);

  return location !== '/' ? (
    <footer className="absolute bottom-0 pb-2 w-full mt-5 hidden lg:block">
      <div className="flex flex-col text-center">
       
        <div className="grid grid-cols-2 w-full px-2">
          
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex justify-center overflow-visible">
              
              <p>  Copyright © DataX 2023</p>
            </div>
          </div>
          <div className="flex text-blue-300 text-xs justify-end items-center">
            <p className="pr-2">{blockNo > 0 ? blockNo : ''}</p>
          
            
          </div>
        </div>
      </div>
    </footer>
  ) : (
    <></>
  );
}
