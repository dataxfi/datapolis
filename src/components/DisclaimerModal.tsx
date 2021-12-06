import { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalState";

export const Disclaimer = (): string => {
  return `Dear user,  
    
    Before you use the DataX software, please be aware of the following risks: 
    
    1. Identity
    Datatokens simply leverage blockchain technology to represent right-to-access underlying assets, and are not actual assets. No custodian holds underlying assets for you on your behalf. You hold no legal rights to the underlying assets, only to datatokens to the blockchain. Also, datatokens are not issued by the DataX and the DataX team bears no responsibility or liability for providing software to interact with synthetic assets like datatokens or ERC20 tokens.
    
    2. Significant risks 
    While the DataX team has carefully engineered and developed DataX products, it is a new technology that may contain significant risks, bugs, or issues that may lead the software to not work as intended. The DataX team does not make any guarantees of the correctness of the software, and disclaim that the underlying software is intended to be used AS-IS, and is to be used at your own risk.
    
    3. Limitations in ownership 
    Given that datatokens are simple synthetic tokens, they do not confer to the bearer many rights that are to be expected in holding the actual underlying asset, such as data asset or data services. Datatokens merely represents right-to-access the underlying datasets.
    
    4. Agency disclaimer 
    No entity, including the DataX team, has control over the list of assets (ERC20 tokens) that are listed and traded on DataX. The DataX team is not responsible for failure of any trades or transactions while using DataX products.`;
};

function DisclaimerModal() {
  const { setDisclaimerSigned, disclaimerSigned, setShowDisclaimer } =
    useContext(GlobalContext);
  const [showReminder, setShowReminder] = useState(false);


  function approvedDisclaimer() {
    if (!disclaimerSigned.client) {
      setDisclaimerSigned({ ...disclaimerSigned, client: true });
    } else {
      setShowReminder(true);
    }
  }

  function deniedDisclaimer() {
    setShowDisclaimer(false);
  }

  return (
    <div className="flex sm:mt-6 md:mt-16 w-full items-center justify-center md:mb-20 z-30 ">
      <div className="h-102 md:h-auto max-w-2xl  sm:mx-4 mx-3 bg-primary-900 w-full rounded-lg p-4 hm-box flex flex-col xs:p-1 sm:p-4 md:px-10 py-4 md:mb-20">
        <h2 className="md:text-2xl text-xl self-center mb-2">Disclaimer</h2>
        <div className="h-3/5 overflow-scroll lg:h-auto md:overflow-auto w-full p-2 bg-primary-700 rounded">
          <p className="whitespace-pre-wrap p-2 text-xs md:text-sm">
            {Disclaimer()}
          </p>
        </div>
        <p className="text-primary-400 my-3 text-xs md:text-sm">
          Please sign this disclaimer to connect to your wallet. Your wallet
          will ask for your signature regarding the same disclaimer.
        </p>
        <div className="flex flex-row w-full">
          <button
            className="w-1/2 text-xs sm:text-sm p-3 active:bg-primary-500  rounded-sm mr-1 transition-colors bg-primary-500 hover:bg-primary-400"
            onClick={deniedDisclaimer}
          >
            Cancel
          </button>
          <button
            className="w-1/2 text-xs sm:text-sm p-3 active:bg-primary-500  rounded-sm mr-1 transition-colors bg-primary-500 hover:bg-primary-400"
            onClick={approvedDisclaimer}
          >
            Agree
          </button>
        </div>
        {showReminder ? (
          <div className="transition-all ease-in-out duration-500 self-center animate-pulse mt-2">
            <p>Sign in your wallet and you will be ready to go!</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DisclaimerModal;
