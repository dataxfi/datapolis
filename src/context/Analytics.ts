import ReactGA from "react-ga4";

export function initializeGA() {
  try {
    if (!process.env.REACT_APP_GA_PROPERTY_ID)
      throw new Error("Missing measurement ID when trying to initialize GA");
    ReactGA.initialize(process.env.REACT_APP_GA_PROPERTY_ID || "");
    ReactGA.send("pageview");
  } catch (error) {
    console.error(error);
  }
}

export function acceptsCookiesGA() {
  try {
    ReactGA.event({
      category: "Cookies",
      action: "User Confirmed Cookies",
      label: "Cookie Event",
    });
  } catch (error) {
    console.error(error);
  }
}

export function deniedCookiesGA() {
  try {
    ReactGA.event({
      category: "Cookies",
      action: "User Denied Cookies",
      label: "Cookie Event",
    });
  } catch (error) {
    console.error(error);
  }
}

export function connectedWalletGA() {
  try {
    ReactGA.event({
      category: "Wallet",
      action: "User Connected Wallet",
      label: "Wallet Event",
    });
  } catch (error) {
    console.error(error);
  }
}

export function deniedSignatureGA() {
  try {
    ReactGA.event({
      category: "Wallet",
      action: "User Denies Signature",
      label: "Wallet Event",
    });
  } catch (error) {
    console.error(error);
  }
}

export function connectedMultipleWalletsGA() {
  try {
    ReactGA.event({
      category: "Wallet",
      action: "User Has Connected Multiple Wallets",
      label: "Wallet Event",
    });
  } catch (error) {
    console.error(error);
  }
}

export function connectedToNetworkGA({
  network,
  chainId,
}: {
  network: string;
  chainId: string;
}) {
  try {
    ReactGA.event({
      category: "Network",
      action: `User connected to ${network} network (${chainId})`,
      label: "Network Event",
    });
  } catch (error) {
    console.error(error);
  }
}

export function connectedWalletViaGA({ wallet }: { wallet: string | null }) {
  try {
    ReactGA.event({
      category: "Wallet",
      action: `User Connected Wallet: ${wallet}`,
      label: "Wallet Event",
    });
  } catch (error) {
    console.error(error);
  }
}

export function transactionTypeGA(type:string){
  try {
    ReactGA.event({
      category: "Transaction",
      action: `User made a transaction: ${type}`,
      label: "Transaction Event",
    });
  } catch (error) {
    console.error(error);
  }
}

export function boughtAmountGA(amount:string, tokenAddress:string){
  try {
    ReactGA.event({
      category: "Transaction",
      action: `User bought ${amount} ${tokenAddress}`,
      label: "Transaction Event",
    });
  } catch (error) {
    console.error(error);
  }
}

export function soldAmountGA(amount:string, tokenAddress:string){
  try {
    ReactGA.event({
      category: "Transaction",
      action: `User sold ${amount} ${tokenAddress}`,
      label: "Transaction Event",
    });
  } catch (error) {
    console.error(error);
  }
}

export function stakeAmountGA(amount:string, tokenStaked:string, pool:string){
  try {
    ReactGA.event({
      category: "Transaction",
      action: `User staked ${amount} ${tokenStaked}, in ${pool}`,
      label: "Transaction Event",
    });
  } catch (error) {
    console.error(error);
  }
}

export function unstakeAmountGA(amount:string, tokenUnstaked:string, pool:string){
  try {
    ReactGA.event({
      category: "Transaction",
      action: `User unstaked ${amount} ${tokenUnstaked}, from ${pool}`,
      label: "Transaction Event",
    });
  } catch (error) {
    console.error(error);
  }
}