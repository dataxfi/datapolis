import { useContext } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { GlobalContext } from '../context/GlobalState';

export const disclaimer = `Dear user,  
    
    Before you use the DataX software, please be aware of the following risks: 
    
    1. Identity
    Datatokens simply leverage blockchain technology to represent right-to-access underlying assets, and are not actual assets. No custodian holds underlying assets for you on your behalf. You hold no legal rights to the underlying assets, only to datatokens to the blockchain. Also, datatokens are not issued by the DataX and the DataX team bears no responsibility or liability for providing software to interact with synthetic assets like datatokens or ERC20 tokens.
    
    2. Significant risks 
    While the DataX team has carefully engineered and developed DataX products, it is a new technology that may contain significant risks, bugs, or issues that may lead the software to not work as intended. The DataX team does not make any guarantees of the correctness of the software, and disclaim that the underlying software is intended to be used AS-IS, and is to be used at your own risk.
    
    3. Limitations in ownership 
    Given that datatokens are simple synthetic tokens, they do not confer to the bearer many rights that are to be expected in holding the actual underlying asset, such as data asset or data services. Datatokens merely represents right-to-access the underlying datasets.
    
    4. Agency disclaimer 
    No entity, including the DataX team, has control over the list of assets (ERC20 tokens) that are listed and traded on DataX. The DataX team is not responsible for failure of any trades or transactions while using DataX products.`;
function DisclaimerModal() {
  const {
    setDisclaimerSigned,
    disclaimerSigned,
    setShowDisclaimer,
    handleSignature,
    setBlurBG,
    showDisclaimer,
    web3,
    setSnackbarItem,
  } = useContext(GlobalContext);

  async function approvedDisclaimer() {
    setDisclaimerSigned({ ...disclaimerSigned, client: true });
    const accounts = await web3?.eth.getAccounts();
    if (accounts && web3) {
      await handleSignature(accounts[0].toLowerCase(), web3, true).catch(() => {
        deniedDisclaimer();
      });
    }
  }
  function deniedDisclaimer() {
    setShowDisclaimer(false);
    setBlurBG(false);
    setDisclaimerSigned({ client: false, wallet: false });
  }

  return showDisclaimer ? (
    <OutsideClickHandler
      onOutsideClick={() => {
        setShowDisclaimer(false);
        setBlurBG(false);
      }}
    >
      <div
        id="disclaimer-modal"
        className="overflow-scroll hm-hide-scrollbar absolute max-h-full left-1/2 top-1/2 px-4 z-30 -translate-x-1/2 -translate-y-1/2 py-4 w-full flex justify-center"
      >
        <div className="h-full max-h-full w-full max-w-2xl bg-black bg-opacity-80 rounded-3xl hm-box flex flex-col p-1 sm:p-4 md:px-10 py-4">
          <h2 className="md:text-2xl text-xl self-center mb-2">Disclaimer</h2>
          <div className="max-h-[450px] lg:max-h-[100%] lg:h-full overflow-scroll md:overflow-auto w-full p-2 bg-primary-900 rounded">
            <p className="whitespace-pre-wrap p-2 text-xs md:text-sm max-h-[70%]">{disclaimer}</p>
          </div>
          <p className="text-primary-400 my-3 text-xs md:text-sm">
            Please sign this disclaimer to connect to your wallet. Your wallet will ask for your signature regarding the
            same disclaimer.
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
        </div>
      </div>
    </OutsideClickHandler>
  ) : (
    <></>
  );
}

export default DisclaimerModal;
