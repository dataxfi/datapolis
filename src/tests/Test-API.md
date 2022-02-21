# Testing functions

## variables

testAcctId:
Main test account Public Key

## Setup / Teardown

setupDappBrowser(acct2: boolean = false)

setupDataX(page: puppeteer.Page, metamask: dappeteer.Dappeteer, network: string, mobile: boolean)

quickConnectWallet(page: puppeteer.Page)

closeBrowser(browser: puppeteer.Browser)

acceptCookies(page: puppeteer.Page)

## All-purpose

useXPath(page: puppeteer.Page, el: string,elText: string, contains: boolean,dt?: boolean, sibling?: "prev" | "next", metamask?: dappeteer.Dappeteer)
- Builds an XPath query. If you want to use with metamask, pass the metamask page directly.

unlockTokens(page: puppeteer.Page, metamask: dappeteer.Dappeteer, amount: "perm" | "once")

approveTransactions(metamask: dappeteer.Dappeteer, page: puppeteer.Page, txAmount: number)

typeAmount(page: puppeteer.Page, amount: string, pos: number, t1Symbol: string, t2Symbol: string, increment: boolean = true)

getPercInDapp(page: puppeteer.Page)

clearInput(page: puppeteer.Page, elID: string)
- Sets an input field to be an empty string.

checkBalance( page: puppeteer.Page, metamask: dappeteer.Dappeteer, updating: boolean = false, t2Symbol?: string, t1Symbol: string = "OCEAN" )
- Checks balance for tokens dapp against balance in metamask. Leaves browser on dapp.

assertTo3(page: puppeteer.Page, truth: string | number, id: string, pos: balancePos, updating: boolean)
- Asserts truth to match dapp element value to 3 decimal places.

getBalanceInMM(metamask: dappeteer.Dappeteer, symbol: string): Promise<string>
- Get balance for token entered from MM

getBalanceInDapp(page: puppeteer.Page, pos: balancePos): Promise<number>
- Return balance for token entered from dapp

getExecuteButtonText(page: puppeteer.Page, txType: ITxType, text?: string)
- Gets the execute button text for assertions.
- @param text - Will wait for the button text to contain this text if supplied.

executeTransaction(page: puppeteer.Page, metamask: dappeteer.Dappeteer, txType: ITxType, unlock: "perm" | "once" = "once")

confirmSwapModal(page: puppeteer.Page, metamask: dappeteer.Dappeteer)

confirmAndCloseTxDoneModal(page: puppeteer.Page, timeout: number = 120000)

reloadOrContinue(lastTestPassed: Boolean, page: puppeteer.Page, stake?: boolean)

## Metamask

importTokens(metamask: dappeteer.Dappeteer, symbol?: string)
- Imports token to MM wallet, defaults to ocean.

clearMMPopup(metamask: dappeteer.Dappeteer)

approve(page: puppeteer.Page, selectAll: boolean = false, version?: string): Promise<void>

switchAccounts(metamask: dappeteer.Dappeteer, page: puppeteer.Page, acct: number, signDisclaimer: boolean)
- Switches metamask accounts.
- @param acct The index of the account to be selected, not 0 indexed. (1 will select the first account in the list, and so on.)
- @param signDisclaimer Will sign the disclaimer in metamask if true is supplied.

## Nav

navToStake(page: puppeteer.Page)

navToLp(page: puppeteer.Page)

navToTrade(page: puppeteer.Page)

navToRemoveStake(page: puppeteer.Page, pool: string)

navToStakeWPool(page: puppeteer.Page, pool: string)

navToLpFromUnstake(page: puppeteer.Page)

navToTradeXFromLanding(page: puppeteer.Page)

## Trade

setUpSwap( page: puppeteer.Page, metamask: dappeteer.Dappeteer, t1Symbol: string, t2Symbol: string, amount: string, inputLoc: number = 1): Promise<void>

getSelectedTokens(page: puppeteer.Page, pos: 1 | 2 | 3)

swapTokens(page: puppeteer.Page)

swapOrSelect(page: puppeteer.Page, t1Symbol: string, t2Symbol: string)

selectToken(page: puppeteer.Page, symbol: string, pos: number)

awaitTokenSelect(page: puppeteer.Page, symbol: string, pos: number)

clickMaxTrade(page: puppeteer.Page)

evaluateMax(page: puppeteer.Page, t1Bal: BigNumber): Promise<IMaxEval>

incrementUntilValid(page: puppeteer.Page, amount: string, t1Symbol: string, t2Symbol: string, inputPos: number)

confirmTokensClearedAfterTrade(page: puppeteer.Page)

## Stake

setUpStake(page: puppeteer.Page, stakeToken: string, stakeAmt: string)

selectStakeToken(page: puppeteer.Page, stakeToken: string)
- Selects a stake pool by token symbol supplied.
- @param stakeToken token symbol, case sensitive

inputStakeAmt(page: puppeteer.Page, stakeAmt: string): Promise<string>
- Inputs value to stake.
- @param stakeAmt A number in string format or 'max'
- @returns The input amount after max calculation.

confirmInputClearedAfterStake(page: puppeteer.Page)

## Unstake

setupUnstake(page: puppeteer.Page, unstakeAmt: string, initialShares?: BigNumber)

inputUnstakeAmt(page: puppeteer.Page, unstakeAmt: string, shares:string)

getSharesFromUnstake(page: puppeteer.Page)

awaitUpdateShares(page: puppeteer.Page, initialShares: BigNumber)
- Waits for shares in unstake page to not equal the shares value passed.

confirmInputClearedAfterUnstake(page: puppeteer.Page)
## LP

grabOrImportPool(page: puppeteer.Page, pool: string, select: boolean)

importStakeInfo(page: puppeteer.Page, pool: string)


## Not yet functional
//get method not fully functional
export type methods = "get" | "set" | "clear" | "remove" | "key" | "length";
useLocalStorage(page: puppeteer.Page, method: methods, data?: { key?: string; value?: string; index?: number })

//not yet tested
hoarder( browser: puppeteer.Browser, metamask: dappeteer.Dappeteer, dumpAcct: string, accounts: number)
