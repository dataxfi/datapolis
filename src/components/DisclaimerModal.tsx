import { useContext, useEffect, useState } from "react";
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
  const [progress, setProgress] = useState("0");
  const { setDisclaimerSigned, disclaimerSigned, setShowDisclaimer } =
    useContext(GlobalContext);
  const [buttonsDisabled, setButtonsDisabled] = useState(
    disclaimerSigned.client === true ? false : true
  );
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    if (disclaimerSigned.client === true) setProgress("2/3");
    if (disclaimerSigned.wallet) setProgress("full");
  }, [disclaimerSigned.wallet]);

  function approvedDisclaimer() {
    if (!disclaimerSigned.client) {
      setDisclaimerSigned({ ...disclaimerSigned, client: true });
      setProgress("2/3");
    } else {
      setShowReminder(true);
    }
  }

  function deniedDisclaimer() {
    setShowDisclaimer(false);
  }

  function handleScroll(e: any) {
    console.log("scrolling");
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom && progress === "0") {
      setButtonsDisabled(false);
      setProgress("1/3");
    }
  }
  return (
    <div className="flex mt-16 w-full items-center mb-20">
      <div className="max-w-2xl md:mx-auto sm:mx-4 mx-3 bg-primary-900 w-full rounded-lg p-4 hm-box flex flex-col px-10 py-4  max-h-96">
        <h2 className="text-2xl self-center">Disclaimer Notice</h2>
        <div
          onScroll={handleScroll}
          className="overflow-scroll h-3/5 w-full p-2 bg-primary-100 rounded text-black"
        >
          <p className="whitespace-pre-wrap">{Disclaimer()}</p>
        </div>
        <p className="text-primary-400">
          Please sign this disclaimer to connect to your wallet. Your wallet
          will ask for your signature regarding the same disclaimer.
        </p>
        <div className="flex flex-row">
          <button
            className={`w-1/2 p-3 active:bg-primary-500 rounded-sm mr-1 transition-colors ${
              buttonsDisabled
                ? "bg-primary-300 text-primary-500"
                : "bg-primary-500 hover:bg-primary-400"
            }`}
            onClick={deniedDisclaimer}
            disabled={buttonsDisabled}
          >
            Cancel
          </button>
          <button
            className={`w-1/2 p-3 active:bg-primary-500  rounded-sm mr-1 transition-colors ${
              buttonsDisabled
                ? "bg-primary-300 text-primary-500"
                : "bg-primary-500 hover:bg-primary-400"
            }`}
            onClick={approvedDisclaimer}
            disabled={buttonsDisabled}
          >
            Agree
          </button>
        </div>
        <div className="relative mt-1 rounded bg-primary-800">
          <div
            className={`overflow-hidden h-2 text-xs flex rounded bg-primary-300 transition-all ease-out duration-1000  w-${progress}`}
          ></div>
        </div>
        {showReminder ? (
          <div className="transition-all ease-in-out duration-500 self-center animate-pulse">
            <p>Sign in your wallet and you will be ready to go!</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DisclaimerModal;
