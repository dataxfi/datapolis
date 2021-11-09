import ReactGA from "react-ga4";

export function initializeGA() {
  ReactGA.initialize(process.env.REACT_APP_GA_PROPERTY_ID || "");
  ReactGA.send("pageview");
}

export function acceptsCookiesGA() {
  ReactGA.event({
    category: "Cookies",
    action: "User Confirmed Cookies",
    label: "Cookie Event",
  });
}

export function deniedCookiesGA() {
  ReactGA.event({
    category: "Cookies",
    action: "User Denied Cookies",
    label: "Cookie Event",
  });
}

export function connectedWalletGA() {
  ReactGA.event({
    category: "Wallet",
    action: "User Connected Wallet",
    label: "Wallet Event",
  });
}

export function deniedSignatureGA() {
  ReactGA.event({
    category: "Wallet",
    action: "User Denies Signature",
    label: "Wallet Event",
  });
}

export function connectedMultipleWalletsGA() {
  ReactGA.event({
    category: "Wallet",
    action: "User Has Connected Multiple Wallets",
    label: "Wallet Event",
  });
}

export function connectedToNetworkGA({
  network,
  chainId,
}: {
  network: string;
  chainId: string;
}) {
  ReactGA.event({
    category: "Network",
    action: `User connected to ${network} network (${chainId})`,
    label: "Network Event",
  });
}

export function connectedWalletViaGA({ wallet }: { wallet: string | null }) {
  ReactGA.event({
    category: "Wallet",
    action: `User Connected A Wallet with ${wallet}`,
    label: "Wallet Event",
  });
}

export function transactionUsingToken({
  sold,
  bought,
}: {
  sold: string;
  bought: string;
}) {
  ReactGA.event({
    category: "Transaction",
    action: `User Sold ${sold}`,
    label: "Transaction Event",
  });

  ReactGA.event({
    category: "Transaction",
    action: `User Bought ${bought}`,
    label: "Transaction Event",
  });
}
