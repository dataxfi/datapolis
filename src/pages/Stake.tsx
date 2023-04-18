import { useEffect, useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import VPmodal from '../components/VPmodal';

export default function Stake() {
  const { provider, accountId } = useContext(GlobalContext);
  const GlobalValues = useContext(GlobalContext);

  useEffect(() => {
    console.log('provider is', provider);
  }, [provider]);

  useEffect(() => {
    console.log('global values', GlobalValues);
  }, [GlobalValues]);

  return (
    <>
      {accountId ? (
        <div className="w-full h-full absolute bg-dataXcity bg-cover bg-right mobileBgPosition lg:bg-bottom">
          <div className="w-full h-full flex flex-col items-center justify-center px-8 lg:px-56 pb-36 text-center">
            <div className="text-4xl lg:text-6xl xl:text-8xl font-yantramanav font-semibold text-shadow-bold">
              <h1>
                <span className="mr-4">Welcome to the Delicate</span>
              </h1>
              <h5>
                <span className="mr-4">(wallet not connected)</span>
              </h5>
            </div>
          </div>
        </div>
      ) : (
        <VPmodal />
      )}
    </>
  );
}
