import MobileNavbar from './MobileNavbar';
import DesktopNavbar from './DesktopNavbar';
import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { supportedChains } from '../@types/types';

const text = {
  T_SWAP: 'Trade',
  T_STAKE: 'Stake',
  T_CONNECT_WALLET: 'Connect to a wallet',
};

const Navbar = () => {
  const walletText = text.T_CONNECT_WALLET;
  const links = [
    // { name: text.T_SWAP, link: '/trade' },
    { name: text.T_STAKE, link: '/stake' },
  ];

  const { buttonText, config, chainId, accountId, setShowTxHistoryModal, handleConnect, setBlurBG, location } =
    useContext(GlobalContext);

  function truncateId() {
    if (!buttonText) return;
    return buttonText.substring(0, 5) + '...' + buttonText.substring(buttonText.length - 4, buttonText.length);
  }

  function getNetName() {
    if (config) {
      let network = config.getNetwork(String(chainId) as supportedChains);
      if (network !== 'unknown') {
        network = network.charAt(0).toUpperCase() + network.slice(1);
        return <p>{network}</p>;
      }
    }
    return (
      <p>
        <span className="text-xs mr-1">⚠</span>Unknown
      </p>
    );
  }

  function handleModalOrConnect() {
    if (accountId) {
      setBlurBG(true);
      setShowTxHistoryModal(true);
    } else {
      handleConnect();
    }
  }

  return location !== '/' ? (
    <nav className="z-20 absolute top-0 w-full">
      {/* Separating the UI logic because figuring out code reuse here will take more time.
            i.e. It's not a simple cascade of columns to rows. There is a toggle and the connect to wallet
            button is at the bottom */}
      <MobileNavbar
        links={links}
        text={text}
        wallet={walletText}
        truncateId={truncateId}
        network={getNetName()}
        handleModalOrConnect={handleModalOrConnect}
      />
      <DesktopNavbar
        links={links}
        text={text}
        wallet={walletText}
        truncateId={truncateId}
        network={getNetName()}
        handleModalOrConnect={handleModalOrConnect}
      />
    </nav>
  ) : (
    <></>
  );
};

export default Navbar;
