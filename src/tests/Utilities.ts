import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { testAcctId } from "./Setup";
import { toFixed3 } from "../utils/equate";
import BigNumber from "bignumber.js";
BigNumber.config({ DECIMAL_PLACES: 18, ROUNDING_MODE: BigNumber.ROUND_DOWN, EXPONENTIAL_AT: 18 });

/**
 * Imports token to MM wallet, defaults to ocean.
 *
 * @param metamask - dappeteer
 * @param symbol - DT symbol
 */

export async function importTokens(metamask: dappeteer.Dappeteer, symbol?: string) {
  const ocean = "0x8967BCF84170c91B0d24D4302C2376283b0B3a07";
  const sagkri = "0x1d0c4f1dc8058a5395b097de76d3cd8804ef6bb4";
  const dazorc = "0x8d2da54a1691fd7bd1cd0a242d922109b0616c68";
  await clearMMPopup(metamask);
  switch (symbol) {
    case "SAGKRI-94":
      await metamask.addToken(sagkri);
      break;
    case "DAZORC-13":
      await metamask.addToken(dazorc);
      break;
    default:
      await metamask.addToken(ocean);
      break;
  }
  await metamask.page.waitForSelector(".asset-breadcrumb");
  await metamask.page.click(".asset-breadcrumb");
  const assets: puppeteer.JSHandle | undefined = await useXPath(metamask.page, "button", "Assets", false);
  //@ts-ignore
  await assets.click();
}

export async function clearMMPopup(metamask: dappeteer.Dappeteer) {
  //clear popoups
  //maybe use useXPath to find an X? could be better
  try {
    await metamask.page.waitForSelector(".fas.fa-times.popover-header__button", { timeout: 1000 });
    await metamask.page.click(".fas.fa-times.popover-header__button");
  } catch (error) {}
}

/**
 * Builds an XPath query. If you want to use with metamask, pass the metamask page directly.
 * @param el -the element to target (a, button, div)
 * @param elText -the text of the element
 * @param contains -pass true to select an element that contains the elText
 * @returns Returns the handle element
 *
 *
 *
 */

export async function useXPath(
  page: puppeteer.Page,
  el: string,
  elText: string,
  contains: boolean,
  dt?: boolean,
  sibling?: "prev" | "next",
  metamask?: dappeteer.Dappeteer
) {
  //might be better to use * instead of el in the future, to ensure this works even if the element changes
  //if( (page instanceof puppeteer.Page) === false ) page === page.page
  const xpath = contains ? `//${el}[contains(text(),'${elText}')]` : `//${el}[text()='${elText}']`;
  const query = `document.evaluate("${xpath}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue`;
  let handle;
  try {
    await page.waitForFunction(query, { timeout: 5000 });
    if (metamask) {
      handle = await metamask.page.$x(xpath);
    } else {
      handle = await page.$x(xpath);
    }
  } catch (error) {
    if (dt && metamask) {
      try {
        await importTokens(metamask, elText);
        await page.waitForFunction(query, { timeout: 5000 });
        handle = await metamask.page.$x(xpath);
      } catch (error) {
        throw error;
      }
    } else {
      throw error;
    }
  }
  if (handle)
    switch (sibling) {
      case "prev":
        return await page.evaluateHandle((el) => el.previousElementSibling, handle[0]);
      case "next":
        return await page.evaluateHandle((el) => el.nextSibling, handle[0]);
      default:
        return handle[0];
    }
  else {
    throw new Error("Couldn't get element handle");
  }
}

async function swapTokens(page: puppeteer.Page) {
  await page.bringToFront();
  const t1Bal = await getBalanceInDapp(page, 1);
  const t2Bal = await getBalanceInDapp(page, 2);

  //swap tokens
  await page.waitForSelector("#swapTokensBtn");
  await page.click("#swapTokensBtn");

  //check all inputs reset
  await page.waitForSelector("#token1-input");
  await page.waitForFunction('document.querySelector("#token1-input").value === ""', { timeout: 1000 });
  await page.waitForFunction('document.querySelector("#token2-input").value === ""', { timeout: 1000 });
  await page.waitForFunction('document.querySelector("#token1-perc-input").value === "0"', { timeout: 1000 });
  await page.waitForTimeout(1000);
  expect(t1Bal).toBe(await getBalanceInDapp(page, 2));
  expect(t2Bal).toBe(await getBalanceInDapp(page, 1));
}

export async function approveTransaction(metamask: dappeteer.Dappeteer, page?: puppeteer.Page) {
  //click activity tab
  const activity = await useXPath(metamask.page, "button", "Activity", false);
  //@ts-ignore
  await activity.click();
  //click tx and confirm
  await metamask.page.waitForSelector(".list-item.transaction-list-item.transaction-list-item--unconfirmed");
  await metamask.page.click(".list-item.transaction-list-item.transaction-list-item--unconfirmed");
  await metamask.page.waitForSelector(".btn-primary", { timeout: 45000 });
  await metamask.confirmTransaction();
  await page?.bringToFront();
}

export async function approveTransactions(metamask: dappeteer.Dappeteer, page: puppeteer.Page, txAmount: number) {
  //open MM
  await metamask.page.bringToFront();
  await clearMMPopup(metamask);
  await approveTransaction(metamask);
  await clearMMPopup(metamask);
  for (let tx = 1; tx < txAmount; tx++) {
    //wait for second tx, click and confirm
    try {
      await metamask.page.waitForSelector(".home__container");
      await metamask.page.waitForSelector("li[data-testid=home__activity-tab] > button");
      await metamask.page.click("li[data-testid=home__activity-tab] > button");
      await metamask.page.waitForSelector(".transaction-status.transaction-status--unapproved");
      await metamask.page.reload();

      await metamask.page.waitForSelector(".btn-primary");
      await metamask.confirmTransaction();
      page.bringToFront();
    } catch (error) {
      console.log(error);
    }
  }
}

/**
 *
 * @param page - puppeteer page
 * @param metamask
 * @param t1Symbol - token1 (sell) symbol
 * @param t2Symbol - token2 (buy) symbol
 * @param amount - amount to input
 * @param inputLoc - input location (token1 field = 1 OR token2 field = 2) defaults to 1
 *
 * Tests:
 *  - Inputs work
 *  - Percentage is always calculated
 *  - Decimals in inputs is 5
 *  - Decimals in perc input is 0
 *  - Button changes to approve and swap
 *
 */

export async function setUpSwap(
  page: puppeteer.Page,
  metamask: dappeteer.Dappeteer,
  t1Symbol: string,
  t2Symbol: string,
  amount: string,
  inputLoc: number = 1
): Promise<void> {
  await page.bringToFront();

  //open modal for token 1
  await page.waitForSelector("#selectToken1");
  await page.waitForTimeout(1000);
  await page.click("#selectToken1");

  //click ocean
  await page.waitForSelector(`#${t1Symbol}-btn`);
  await page.waitForTimeout(500);
  await page.click(`#${t1Symbol}-btn`);

  //open modal for token 2
  await page.waitForSelector("#selectToken2");
  await page.waitForTimeout(500);
  await page.click("#selectToken2");

  //click sagkri-94
  await page.waitForSelector(`#${t2Symbol}-btn`);
  await page.waitForTimeout(500);
  await page.click(`#${t2Symbol}-btn`);

  if (amount === "max") {
    await page.waitForTimeout(1000);
    await page.waitForSelector("#maxTrade");
    await page.click("#maxTrade");
    await page.waitForFunction('Number(document.querySelector("#token1-input").value) > 0', { timeout: 5000 });
  } else {
    if (inputLoc === 1 || !inputLoc) {
      //input amount into token 1
      await page.waitForSelector("#token1-input");
      await page.click("#token1-input");
      await page.type("#token1-input", amount, { delay: 300 });
      if (Number(amount) > 0)
        await page.waitForFunction('Number(document.querySelector("#token2-input").value) > 0', { timeout: 5000 });
    } else {
      //input amount into token 2
      await page.waitForSelector("#token2-input");
      await page.click("#token2-input");
      await page.type("#token2-input", amount, { delay: 300 });
      if (Number(amount) > 0)
        await page.waitForFunction('Number(document.querySelector("#token1-input").value) > 0', { timeout: 5000 });
    }
  }

  //get max values for each token
  await page.waitForSelector("[data-test-max]");
  await page.waitForSelector("[data-test-max]");
  const t1Max: BigNumber = new BigNumber(
    await page.evaluate('document.querySelectorAll("[data-test-max]")[0].getAttribute("data-test-max")')
  );
  const t2Max: BigNumber = new BigNumber(
    await page.evaluate('document.querySelectorAll("[data-test-max]")[1].getAttribute("data-test-max")')
  );

  //get values in each input field
  const t1Input: BigNumber = new BigNumber(await page.evaluate('document.querySelector("#token1-input").value'));
  const t2Input: BigNumber = new BigNumber(await page.evaluate('document.querySelector("#token2-input").value'));

  //test decimals limited to 5
  const afterPeriod = /\.(.*)/;
  const t1Decimals = t1Input.toString().match(afterPeriod);
  const t2Decimals = t2Input.toString().match(afterPeriod);
  if (t1Decimals) expect(t1Decimals[1].length).toBeLessThanOrEqual(5);
  if (t2Decimals) expect(t2Decimals[1].length).toBeLessThanOrEqual(5);

  //test max limits inputs
  expect(t1Max.gte(t1Input.toNumber())).toBeTruthy();
  expect(t2Max.gte(t2Input.toNumber())).toBeTruthy();
  if (t1Input.lt(t1Max)) expect(t2Max.gt(t2Input)).toBeTruthy();

  //check value in percent field, balance field, and input field
  const balance = new BigNumber(await getBalanceInMM(metamask, t1Symbol));
  await page.bringToFront();

  //perc should have no decimals, be greater than 0, should be correct
  await page.waitForSelector("#token1-perc-input");

  const percApprox: BigNumber = t1Input.div(balance).times(100).dp(3);

  let perc;
  if (percApprox.gt(0)) {
    await page.waitForFunction('Number(document.querySelector("#token1-perc-input").value) > 0', { timeout: 3000 });
    perc = new BigNumber(await page.evaluate('document.querySelector("#token1-perc-input").value'));
    expect(Number(perc)).toBeGreaterThan(0);
    percApprox.gt(100) ? expect(perc).toStrictEqual("100") : expect(perc).toStrictEqual(percApprox);
  } 
}

/**
 * Checks balance for tokens dapp against balance in metamask. Leaves browser on dapp.
 * @param page
 * @param metamask
 * @param updating - wait for balance to update and then assert
 * @param t2Symbol - optionally check 2 tokens
 * @param t1Symbol - optionally change t1Symbol, defaults to "OCEAN"
 */

export async function checkBalance(
  page: puppeteer.Page,
  metamask: dappeteer.Dappeteer,
  updating: boolean = false,
  t2Symbol?: string,
  t1Symbol: string = "OCEAN"
) {
  const t1Bal = await getBalanceInMM(metamask, t1Symbol);
  //@ts-ignore
  await assertTo3(page, t1Bal, "token1-balance", 1, updating);
  if (t2Symbol) {
    let t2Bal = await getBalanceInMM(metamask, t2Symbol);
    //@ts-ignore
    await assertTo3(page, t2Bal, "token2-balance", 2, updating);
  }
  await page.bringToFront();
}
/**
 * Asserts truth to match dapp element value to 3 decimal places.
 * @param page - puppeteer page (dapp)
 * @param truth - source of truth to asser against (will be coerced to num)
 * @param id - id in dapp to check against (dont include #)
 */

async function assertTo3(page: puppeteer.Page, truth: string | number, id: string, pos: number, updating: boolean) {
  await page.bringToFront();
  id = `#${id}`;
  await page.waitForSelector(id);
  let dappBal = await getBalanceInDapp(page, pos);
  console.log("Balance in Dapp:", dappBal);
  console.log("Balance to match:", truth);

  if (updating && Number(toFixed3(dappBal)) !== Number(toFixed3(truth))) {
    // no-touchy!!
    await page.waitForFunction(
      (id: string, truth: string) =>
        //@ts-ignore
        // prettier-ignore
        document.querySelector(id).innerText.match(/\:\s(.*)/)[1].replace(/[,]/, "").match(/^-?\d+(?:\.\d{0,3})?/)[0] === truth,
      {},
      id,
      truth
    );
  }
  expect(Number(toFixed3(dappBal))).toBeCloseTo(Number(toFixed3(truth)), 3);
}

/**
 * Get balance for token entered from MM
 * @param metamask
 * @param symbol
 * @return string of balance
 */

async function getBalanceInMM(metamask: dappeteer.Dappeteer, symbol: string): Promise<string> {
  await metamask.page.bringToFront();
  const assets: puppeteer.JSHandle | undefined = await useXPath(metamask.page, "button", "Assets", false);
  //@ts-ignore
  await assets.click();
  const tokenBalHandle = await useXPath(metamask.page, "span", symbol, false, true, "prev", metamask);
  if (tokenBalHandle) {
    const innerTextHandle = await tokenBalHandle.getProperty("innerText");
    const innerText = await innerTextHandle.jsonValue();
    //@ts-ignore
    return innerText;
  }
  throw new Error("Couldnt get balance.");
}

/**
 * Return balance for token entered from dapp
 * @param metamask
 * @param symbol
 * @return balance as a string
 */

const afterColon = /\:\s(.*)/;
const commas = /[,]/;
async function getBalanceInDapp(page: puppeteer.Page, pos: number) {
  await page.bringToFront();
  await page.waitForSelector(`#token${pos}-balance`);
  let balance = await page.evaluate(`document.querySelector("#token${pos}-balance").innerText`);
  const match = balance.match(afterColon);
  const number = match[1].replace(commas, "");
  balance = Number(number);
  return balance;
}

export async function executeTransaction(page: puppeteer.Page, txType: "trade" | "stake" | "unstake") {
  await page.bringToFront();
  switch (txType) {
    case "stake":
      //future
      break;
    case "unstake":
      //future
      break;
    default:
      await page.click("#executeTradeBtn");
      await page.waitForFunction('document.querySelector("#executeTradeBtn").innerText === "Approve & Swap"', {
        timeout: 5000,
      });
      await page.waitForSelector("#confirmSwapModalBtn");
      await page.click("#confirmSwapModalBtn");
      //find and return the approval amount
      await page.waitForSelector("#confirmItem");
      const confirmations = await page.evaluate('document.querySelectorAll("#confirmItem").length');
      return confirmations;
  }
}

export async function navToStake(page: puppeteer.Page) {
  await page.bringToFront();
  await page.waitForSelector("#StakeX-link");
  await page.click("#StakeX-link");
}

export async function navToLp(page: puppeteer.Page) {
  await navToStake(page);
  await acceptCookies(page);
  await page.waitForSelector("#lpLink");
  await page.click("#lpLink");
  await page.waitForSelector("#lpModal");
}

export async function navToRemoveStake(page: puppeteer.Page, pool: string) {
  await navToLp(page);

  try {
    await page.waitForSelector(`#${pool}-lp-item`, { timeout: 3000 });
  } catch (error) {
    try {
      await importStakeInfo(page, pool);
      await page.waitForSelector(`#${pool}-lp-item`, { timeout: 10000 });
    } catch (error) {
      throw error;
    }
  }
  await page.click(`#${pool}-lp-item`);
  await page.waitForSelector("#lp-remove-link");
  await page.click("#lp-remove-link");
  await page.waitForSelector("#removeStakeModal");
}

export async function acceptCookies(page: puppeteer.Page) {
  await page.waitForSelector("#cookiesModal");
  await page.waitForSelector("#confirmCookies");
  await page.click("#confirmCookies");
  await page.waitForTimeout(500);
}

export async function setupRemoveStake(page: puppeteer.Page, unstakeAmt: string) {
  if (unstakeAmt === "max") {
    await page.waitForSelector("#maxUnstakeBtn");
    await page.click("#maxUnstakeBtn");
    await page.waitForSelector("#unstakeAmtInput");
    await page.waitForFunction('Number(document.querySelector("#unstakeAmtInput").value) > 0');
    await page.waitForSelector("#oceanToReceive");
    await page.waitForFunction('Number(document.querySelector("#oceanToReceive").innerText) > 0');
  } else {
    await page.waitForSelector("#unstakeAmtInput");
    await page.type("#unstakeAmtInput", unstakeAmt, { delay: 150 });
    await page.waitForSelector("#oceanToReceive");
    await page.waitForFunction('Number(document.querySelector("#oceanToReceive").innerText) > 0');
  }

  await page.waitForSelector("#executeUnstake");
  await page.waitForFunction('document.querySelector("#executeUnstake").innerText === "Approve and Withdrawal"');
  await page.waitForTimeout(500);
  await page.click("#executeUnstake");
}

export async function setUpStake(page: puppeteer.Page, stakeToken: string, stakeAmount: string) {
  //open token modal
  await page.waitForSelector("#stakeSelectBtn");
  await page.click("#stakeSelectBtn");

  //selectToken
  await page.waitForSelector(`#${stakeToken}-btn`);
  await page.click(`#${stakeToken}-btn`);
  await page.waitForSelector("#stakeToken");
  await page.waitForFunction("document.querySelector('#stakeToken').innerText === 'SAGKRI-94'");
  await page.waitForSelector("#swapRate");
  await page.waitForSelector("#poolLiquidity");
  await page.waitForSelector("#yourLiquidity");

  //input amount
  if (stakeAmount === "max") {
    await page.waitForSelector("#maxStake");
    await page.click("#maxStake");
    await page.waitForSelector("#stakeAmtInput");
    await page.waitForFunction('Number(document.querySelector("#stakeAmtInput").value) > 0');
  } else {
    await page.waitForSelector("#stakeAmtInput");
    await page.type("#stakeAmtInput", stakeAmount, { delay: 150 });
  }

  //wait for calculation and button
  await page.waitForSelector("#executeStake");
  await page.waitForFunction("document.querySelector('#executeStake').innerText === 'Stake'");
  await page.waitForTimeout(500);
  await page.click("#executeStake");
}

export async function confirmAndCloseTxDoneModal(page: puppeteer.Page, timeout: number = 120000) {
  await page.bringToFront();
  await page.waitForSelector("#transactionDoneModal", { timeout: timeout });
  await page.waitForSelector("#transactionDoneModalCloseBtn");
  await page.click("#transactionDoneModalCloseBtn");
}

export async function confirmTokensClearedAfterTrade(page: puppeteer.Page) {
  await page.bringToFront();
  await page.waitForFunction('document.querySelectorAll("#selectTokenBtn").length === 2');
  await page.waitForTimeout(500);
}

export async function confirmInputClearedAfterStake(page: puppeteer.Page) {
  await page.waitForSelector("#executeStake");
  await page.waitForFunction("document.querySelector('#executeStake').innerText === 'Enter OCEAN Amount'");
  await page.waitForSelector("#stakeAmtInput");
  await page.waitForFunction("document.querySelector('#stakeAmtInput').value === '0'");
}

export async function confirmInputClearedAfterUnstake(page: puppeteer.Page) {
  await page.waitForSelector("#executeUnstake");
  await page.waitForFunction('document.querySelector("#executeUnstake").innerText === "Enter Amount to Remove"');
  await page.waitForSelector("#unstakeAmtInput");
  await page.waitForFunction('document.querySelector("#unstakeAmtInput").value === "0"');
}

export async function reloadOrContinue(lastTestPassed: Boolean, page: puppeteer.Page, stake?: boolean) {
  if (lastTestPassed) return;
  page.reload();
  await page.setViewport({ width: 1039, height: 913 });
  await page.waitForSelector("#d-wallet-button");
  await page.click("#d-wallet-button");
  if (stake) navToStake(page);
}

//get method not fully functional
export type methods = "get" | "set" | "clear" | "remove" | "key" | "length";
export async function useLocalStorage(
  page: puppeteer.Page,
  method: methods,
  data?: { key?: string; value?: string; index?: number }
) {
  console.log(data);

  switch (method) {
    case "get":
      if (data)
        return await page.evaluate((data, testAcctId) => window.localStorage.getItem(data.key || ""), data, testAcctId);
      break;
    case "set":
      if (data) await page.evaluate((data) => window.localStorage.setItem(data.key || "", data.value || ""), data);
      break;
    case "clear":
      await page.evaluate(() => window.localStorage.clear());
      break;
    case "key":
      if (data) await page.evaluate((data) => window.localStorage.key(data.index || 0), data);
      break;
    case "length":
      return await page.evaluate(() => window.localStorage.length);
    case "remove":
      if (data) await page.evaluate((data) => window.localStorage.removeItem(data.key || ""), data);
      break;
  }
}

export async function importStakeInfo(page: puppeteer.Page, pool: string) {
  await page.waitForSelector("#importStakeBtn");
  await page.click("#importStakeBtn");

  await page.waitForSelector(`#${pool}-btn`);
  await page.click(`#${pool}-btn`);
}

//not yet tested
export async function hoarder(
  browser: puppeteer.Browser,
  metamask: dappeteer.Dappeteer,
  dumpAcct: string,
  accounts: number
) {
  const context = browser.defaultBrowserContext();
  context.overridePermissions(metamask.page.url(), ["clipboard-read"]);
  const oceanFaucet = await browser.newPage();
  const chainlinkFaucet = await browser.newPage();
  chainlinkFaucet.goto("https://faucets.chain.link/rinkeby");
  oceanFaucet.goto("https://faucet.rinkeby.oceanprotocol.com/send?address=0x7c8a5A7c34C8D9Bff143bEf41EaFfaAb8d543c87");
  metamask.page.bringToFront();
  for (let i = 0; i < accounts; i++) {
    await metamask.page.waitForSelector(".account-menu__icon");
    await metamask.page.click(".account-menu__icon");
    await metamask.page.waitForSelector(".account-menu__item account-menu__item--clickable");
    await metamask.page.click(".account-menu__item account-menu__item--clickable");
    await metamask.page.waitForSelector(".btn-primary");
    await metamask.page.click(".btn-primary");
    await metamask.page.waitForSelector(".selected-account__clickable");
    await metamask.page.click(".selected-account__clickable");
    await metamask.page.waitForTimeout(1000);
    const address = await metamask.page.evaluate(() => navigator.clipboard.readText());
    console.log("Current address:", address);
    await oceanFaucet.bringToFront();
    await oceanFaucet.type(".selected-account__clickable", address);
    await oceanFaucet.click("#createBtn");
    await chainlinkFaucet.bringToFront();
    await chainlinkFaucet.waitForSelector("#accountAddress");
    await chainlinkFaucet.type(address, "#accountAddress");
    await chainlinkFaucet.waitForSelector(".recaptcha-checkbox-border");
    await chainlinkFaucet.click(".recaptcha-checkbox-border");
    await chainlinkFaucet.waitForTimeout(1500);
    await chainlinkFaucet.click(".Box-sc-1vpmd2a-0.Button-sc-1sg3lik-0.kaOPyJ");
  }
}
