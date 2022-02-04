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
    <div id="disclaimer-modal" className="absolute w-full h-full max-h-full z-10 overflow-hidden py-18">
      <div className="h-102 md:h-full max-w-2xl m-auto bg-black bg-opacity-80 w-full rounded-lg p-4 hm-box flex flex-col xs:p-1 sm:p-4 md:px-10 py-4">
        <h2 className="md:text-2xl text-xl self-center mb-2">Disclaimer</h2>
        <div className="h-3/5 lg:h-full overflow-scroll md:overflow-auto w-full p-2 bg-primary-900 rounded">
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
            id="deny-disclaimer-btn"
            className="w-1/2 text-xs sm:text-sm p-3 mr-1 rounded-lg txButton"
            onClick={deniedDisclaimer}
          >
            Cancel
          </button>
          <button
            id="sign-disclaimer-btn"
            className="w-1/2 text-xs sm:text-sm p-3 ml-1 rounded-lg txButton"
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
