import puppeteer, { JSHandle, Puppeteer } from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { quickConnectWallet, testAcctId } from "./Setup";
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
  const zeasea = "0xcf6823cf19855696d49c261e926dce2719875c3d";
  await clearMMPopup(metamask);
  switch (symbol) {
    case "SAGKRI-94":
      await metamask.addToken(sagkri);
      break;
    case "DAZORC-13":
      await metamask.addToken(dazorc);
      break;
    case "ZEASEA-66":
      await metamask.addToken(zeasea);
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

export async function getSelectedTokens(page: puppeteer.Page, pos: 1 | 2 | 3) {
  let currentT1: string, currentT2: string;
  try {
    const t1Handle = await page.waitForSelector("#selectedToken1", { timeout: 3000 });
    currentT1 = (await (await t1Handle?.getProperty("innerText"))?.jsonValue()) || "";
  } catch (error) {
    currentT1 = "";
  }
  if (pos === 1) return currentT1;

  try {
    const t2Handle = await page.waitForSelector("#selectedToken2", { timeout: 3000 });
    currentT2 = (await (await t2Handle?.getProperty("innerText"))?.jsonValue()) || "";
  } catch (error) {
    currentT2 = "";
  }
  if (pos === 2) return currentT2;

  return { currentT1, currentT2 };
}

export async function unlockTokens(page: puppeteer.Page, metamask: dappeteer.Dappeteer, amount: "perm" | "once") {
  await page.waitForSelector("#perm-unlock-btn");
  await page.waitForSelector("#unlock-once-btn");

  if (amount === "perm") {
    await page.click("#perm-unlock-btn");
  } else {
    await page.click("#unlock-once-btn");
  }

  await metamask.confirmTransaction();
}

export async function swapTokens(page: puppeteer.Page) {
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

export async function selectToken(page: puppeteer.Page, symbol: string, pos: number) {
  //open modal for token pos
  await page.waitForSelector(`#selectToken${pos}`);
  await page.waitForTimeout(500);
  await page.click(`#selectToken${pos}`);

  //click token
  await page.waitForSelector(`#${symbol}-btn`);
  await page.waitForTimeout(500);
  await page.click(`#${symbol}-btn`);
}

export async function awaitTokenSelect(page: puppeteer.Page, symbol: string, pos: number) {
  await page.waitForSelector(`#selectedToken${pos}`);
  await page.waitForFunction(`document.querySelector("#selectedToken${pos}").innerText === "${symbol}"`);
}

export async function swapOrSelect(page: puppeteer.Page, t1Symbol: string, t2Symbol: string) {
  await page.bringToFront();

  let currentT1;
  let currentT2;
  currentT1 = await getSelectedTokens(page, 1);
  currentT2 = await getSelectedTokens(page, 2);

  console.log(t1Symbol, t2Symbol, currentT1, currentT2);
  if (currentT1 && currentT2 && t1Symbol === currentT2 && t2Symbol === currentT1) {
    console.log("Swapping 1");
    await swapTokens(page);
    return;
  } else if (currentT1 && t2Symbol === currentT1) {
    console.log("Swapping 2");
    await swapTokens(page);
  } else if (currentT2 && t1Symbol === currentT2) {
    console.log("Swapping 3");
    await swapTokens(page);
  }

  if (!currentT1 || t1Symbol !== currentT1) {
    console.log("Selecting 1");
    await selectToken(page, t1Symbol, 1);
  }

  if (!currentT2 || t2Symbol !== currentT2) {
    console.log("Selecting 2");
    await selectToken(page, t2Symbol, 2);
  }

  await awaitTokenSelect(page, t1Symbol, 1);
  await awaitTokenSelect(page, t2Symbol, 2);
}

export async function approveTransactions(metamask: dappeteer.Dappeteer, page: puppeteer.Page, txAmount: number) {
  //open MM
  await metamask.page.bringToFront();
  const activity = await useXPath(metamask.page, "button", "Activity", false);
  //@ts-ignore
  await activity.click();
  // if (txAmount > 1)
  //   try {
  //     console.log("a1");

  //     await clearMMPopup(metamask);
  //     await metamask.page.waitForSelector(".list-item.transaction-list-item.transaction-list-item--unconfirmed");
  //     await metamask.page.click(".list-item.transaction-list-item.transaction-list-item--unconfirmed");
  //     await metamask.page.waitForSelector(".btn-primary", { timeout: 45000 });
  //     await metamask.confirmTransaction();
  //   } catch (error) {
  //     console.log(error);
  //   }
  for (let tx = 0; tx < txAmount; tx++) {
    //wait for second tx, click and confirm
    try {
      await clearMMPopup(metamask);
      await metamask.page.waitForSelector(".home__container");
      await metamask.page.waitForSelector("li[data-testid=home__activity-tab] > button");
      await metamask.page.click("li[data-testid=home__activity-tab] > button");
      await metamask.page.waitForSelector(".transaction-status.transaction-status--unapproved");
      await metamask.page.reload();
      await metamask.page.waitForSelector(".btn-primary");
      await metamask.confirmTransaction();
    } catch (error) {
      console.log(error);
    }
  }
  return;
}

export async function clickMaxTrade(page: puppeteer.Page) {
  await page.bringToFront();
  await page.waitForTimeout(1000);
  await page.waitForSelector("#maxTrade");
  await page.click("#maxTrade");
  await page.waitForFunction('Number(document.querySelector("#token1-input").value) > 0', { timeout: 5000 });
}

export async function typeAmount(
  page: puppeteer.Page,
  amount: string,
  pos: number,
  t1Symbol: string,
  t2Symbol: string,
  increment: boolean = true
) {
  await page.waitForSelector(`#token${pos}-input`);
  await page.click(`#token${pos}-input`);
  await page.waitForTimeout(500);
  await page.type(`#token${pos}-input`, amount);
  if (Number(amount) > 0) {
    await page.waitForFunction('Number(document.querySelector("#token2-input").value) > 0', { timeout: 5000 });
    if (increment) await incrementUntilValid(page, amount, t1Symbol, t2Symbol, 1);
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

  await swapOrSelect(page, t1Symbol, t2Symbol);

  if (amount === "max") {
    await clickMaxTrade(page);
  } else {
    await typeAmount(page, amount, inputLoc, t1Symbol, t2Symbol);
    if (amount === "0") return;
  }

  //get max values for each token and value in input field
  const { t1Max, t2Max, t1Input, t2Input } = await evaluateMax(page);

  //test decimals limited to 5
  const afterPeriod = /\.(.*)/;
  const t1Decimals = t1Input.toString().match(afterPeriod);
  const t2Decimals = t2Input.toString().match(afterPeriod);
  if (t1Decimals) expect(t1Decimals[1].length).toBeLessThanOrEqual(5);
  if (t2Decimals) expect(t2Decimals[1].length).toBeLessThanOrEqual(5);

  //test max limits inputs
  expect(t1Max.toNumber()).toBeGreaterThanOrEqual(t1Input.toNumber());
  expect(t2Max.toNumber()).toBeGreaterThanOrEqual(t2Input.toNumber());
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
    perc = await getPercInDapp(page);
    expect(perc.toNumber()).toBeGreaterThan(0);
    percApprox.gt(100)
      ? expect(perc.toString()).toEqual("100")
      : expect(Number(perc)).toBeCloseTo(percApprox.toNumber());
  }
}

export async function getPercInDapp(page: puppeteer.Page) {
  return new BigNumber(await page.evaluate('document.querySelector("#token1-perc-input").value'));
}

interface IMaxEval {
  t1Max: BigNumber;
  t2Max: BigNumber;
  t1Input: BigNumber;
  t2Input: BigNumber;
  limit: "max" | "bal";
}

export async function evaluateMax(page: puppeteer.Page): Promise<IMaxEval> {
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
  let t1Input: BigNumber = new BigNumber(await page.evaluate('document.querySelector("#token1-input").value'));
  let t2Input: BigNumber = new BigNumber(await page.evaluate('document.querySelector("#token2-input").value'));

  if (t1Input.isNaN()) t1Input = new BigNumber(0);
  if (t2Input.isNaN()) t2Input = new BigNumber(0);

  let limit: "max" | "bal";

  if (t1Max > t1Input || t2Max > t2Input) {
    limit = "bal";
  } else {
    limit = "max";
  }

  return {
    t1Max,
    t2Max,
    t1Input,
    t2Input,
    limit,
  };
}

export async function incrementUntilValid(
  page: puppeteer.Page,
  amount: string,
  t1Symbol: string,
  t2Symbol: string,
  inputPos: number
) {
  let t1val = new BigNumber(await page.evaluate('document.querySelector("#token1-input").value'));
  let t2val = new BigNumber(await page.evaluate('document.querySelector("#token2-input").value'));
  let amountBN = new BigNumber(amount);
  let t1Limit = t1Symbol === "OCEAN" ? 0.01 : 0.001;
  let t2Limit = t2Symbol === "OCEAN" ? 0.01 : 0.001;
  if (t1val.lt(t1Limit) || t2val.lt(t2Limit)) {
    amountBN = amountBN.plus(0.5);
    await clearInput(page, `#token${inputPos}-input`);
    await page.click(`#token${inputPos}-input`);
    await page.waitForTimeout(500);
    await page.type(`#token${inputPos}-input`, amountBN.dp(5).toString());
    incrementUntilValid(page, amountBN.dp(5).toString(), t1Symbol, t2Symbol, inputPos);
  }
  return;
}

export async function clearInput(page: puppeteer.Page, elID: string) {
  await page.waitForSelector(elID);
  await page.evaluate(`() => document.getElementById("${elID}").value = ""`);
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
  console.log(dappBal, truth);

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

export async function getBalanceInMM(metamask: dappeteer.Dappeteer, symbol: string): Promise<string> {
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

const afterColon = /\:\s(.*)/;
const commas = /[,]/;
export function getAfterColon(value: string) {
  const match = value.match(afterColon);
  if (match) return match[1].replace(commas, "");
}

/**
 * Return balance for token entered from dapp
 * @param metamask
 * @param symbol
 * @return balance as a string
 */

export async function getBalanceInDapp(page: puppeteer.Page, pos: number): Promise<number> {
  await page.bringToFront();
  await page.waitForSelector(`#token${pos}-balance`);
  let balance = await page.evaluate(`document.querySelector("#token${pos}-balance").innerText`);
  const match = balance.match(afterColon);
  const number = match[1].replace(commas, "");
  balance = Number(number);
  return balance;
}

type ITxType = "trade" | "stake" | "unstake";

export async function getExecuteButtonText(page: puppeteer.Page, txType: ITxType) {
  switch (txType) {
    case "stake":
      await page.waitForSelector("#executeStake");
      return await page.evaluate('document.querySelector("#executeStake").innerText');
    case "unstake":
      await page.waitForSelector("#executeUnstake");
      return await page.evaluate('document.querySelector("#executeUnstake").innerText');
      break;
    default:
      await page.waitForSelector("#executeTradeBtn");
      return await page.evaluate('document.querySelector("#executeTradeBtn").innerText');
  }
}

export async function executeTransaction(
  page: puppeteer.Page,
  metamask: dappeteer.Dappeteer,
  txType: ITxType,
  unlock: "perm" | "once" = "once"
) {
  await page.bringToFront();
  let btnHandle: puppeteer.JSHandle | null;
  switch (txType) {
    case "stake":
      await page.waitForSelector("#executeStake");
      btnHandle = await page.$("#executeStake");
      await page.waitForFunction('document.querySelector("#executeStake").innerText !== "Enter OCEAN Amount"');
      break;
    case "unstake":
      await page.waitForSelector("#executeUnstake");
      btnHandle = await page.$("#executeUnstake");
      await page.waitForFunction('document.querySelector("#executeUnstake").innerText !== "Enter Amount to Remove"');
      break;
    default:
      await page.waitForSelector("#executeTradeBtn");
      btnHandle = await page.$("#executeTradeBtn");
  }

  if (btnHandle) {
    const innerTextHandle = await btnHandle.getProperty("innerText");
    const innerText: string = await innerTextHandle.jsonValue();
    console.log(innerText);

    //@ts-ignore
    await btnHandle.click();
    if (innerText.includes("Unlock")) {
      await unlockTokens(page, metamask, unlock);
      if (txType === "trade") await confirmSwapModal(page, metamask);
      await metamask.page.bringToFront();
    } else {
      if (txType === "trade") await confirmSwapModal(page, metamask);
      await metamask.page.bringToFront();
    }
  }
}

export async function confirmSwapModal(page: puppeteer.Page, metamask: dappeteer.Dappeteer) {
  await page.bringToFront();
  console.log("in swap modal");

  await page.waitForSelector("#confirmSwapModalBtn");
  await page.click("#confirmSwapModalBtn");
  console.log("AWEHOgiohgei");

  await metamask.page.bringToFront();
  await metamask.page.bringToFront();
  await metamask.page.bringToFront();
  await metamask.page.bringToFront();
  await metamask.page.bringToFront();
  //find and return the approval amount
  // await page.waitForSelector("#confirmItem");
  // const confirmations = await page.evaluate('document.querySelectorAll("#confirmItem").length');
  // return confirmations;
}

export async function navToStake(page: puppeteer.Page) {
  await page.bringToFront();
  await page.waitForSelector("#StakeX-link");
  await page.click("#StakeX-link");
}

export async function navToLp(page: puppeteer.Page) {
  await navToStake(page);
  await page.waitForSelector("#lpLink");
  await page.click("#lpLink");
  await page.waitForSelector("#lpModal");
}

export async function navToTrade(page: puppeteer.Page) {
  await page.bringToFront();
  await page.waitForSelector("#TradeX-link");
  await page.click("#TradeX-link");
}

export async function grabOrImportPool(page: puppeteer.Page, pool: string, select: boolean) {
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
}

export async function navToRemoveStake(page: puppeteer.Page, pool: string) {
  await navToLp(page);
  grabOrImportPool(page, pool, true);
  await page.waitForSelector("#yourShares");
  const shares = new BigNumber(await page.evaluate('document.querySelector("#yourShares").innerText'));
  await page.waitForSelector("#lp-remove-link");
  await page.click("#lp-remove-link");
  await page.waitForSelector("#removeStakeModal");
  return shares;
}

export async function navToStakeWPool(page: puppeteer.Page, pool: string) {
  grabOrImportPool(page, pool, true);
  await page.waitForSelector("#lp-add-link");
  await page.click("#lp-add-link");
  await page.waitForSelector("#stakeModal");
}

export async function navToLpFromUnstake(page: puppeteer.Page) {
  await page.waitForSelector("#remove-lp-link");
  await page.click("#remove-lp-link");
  await page.waitForSelector("#lpModal");
}

export async function acceptCookies(page: puppeteer.Page) {
  await page.waitForSelector("#cookiesModal");
  await page.waitForSelector("#confirmCookies");
  await page.click("#confirmCookies");
  await page.waitForTimeout(500);
}

export async function setupUnstake(page: puppeteer.Page, unstakeAmt: string, initialShares?: BigNumber) {
  await page.waitForSelector("#executeUnstake[disabled]");

  //check btn text and btn is disabled
  await page.$("#executeUnstake[disabled]");
  const InitBtnText = await page.evaluate('document.querySelector("#executeUnstake").innerText');
  expect(InitBtnText).toBe("Enter Amount to Remove");

  //wait 6s max for loading lp to dissapear
  await page.waitForFunction('document.querySelector("#loading-lp") === null', { timeout: 6000 });

  //select input and receive amt to have max data attributes
  await page.waitForSelector("[data-test-max-perc]");
  await page.waitForSelector("[data-test-max-ocean]");

  await page.waitForFunction(
    'Number(document.querySelector("[data-test-max-ocean]").getAttribute("data-test-max-ocean")) > 0',
    { timeout: 5000 }
  );
  await page.waitForFunction(
    'Number(document.querySelector("[data-test-max-perc]").getAttribute("data-test-max-perc")) > 0',
    { timeout: 5000 }
  );

  const maxOcean = new BigNumber(
    await page.evaluate('document.querySelector("[data-test-max-ocean]").getAttribute("data-test-max-ocean")')
  );
  const maxPerc = new BigNumber(
    await page.evaluate('document.querySelector("[data-test-max-perc]").getAttribute("data-test-max-perc")')
  );

  const sharesString = await getShares(page);
  console.log(sharesString);

  let shares;
  if (sharesString) {
    shares = new BigNumber(sharesString);
  } else {
    throw new Error("Couldnt get shares");
  }

  if (initialShares && shares) {
    expect(initialShares.toNumber()).toBeCloseTo(shares.toNumber());
  }

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
    if (maxOcean.gt(0)) await page.waitForFunction('Number(document.querySelector("#oceanToReceive").innerText) > 0');
    const oceanReceived = new BigNumber(
      await page.evaluate('Number(document.querySelector("#oceanToReceive").innerText)')
    );
    expect(oceanReceived.dp(5).lte(maxOcean)).toBeTruthy();
    const input = new BigNumber(await page.evaluate('document.querySelector("#unstakeAmtInput").value'));
    expect(input.lte(maxPerc)).toBeTruthy();
    if (maxPerc.gt(Number(unstakeAmt))) expect(input.eq(Number(unstakeAmt)));
  }

  // await page.waitForFunction('document.querySelector("#executeUnstake").innerText === "Approve and Withdrawal"');
  // await page.waitForTimeout(500);
  // await page.click("#executeUnstake");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function approve(page: puppeteer.Page, selectAll: boolean = false, version?: string): Promise<void> {
  await page.bringToFront();
  await page.reload();

  if (selectAll) {
    const checkbox = await page.waitForSelector(".permissions-connect-choose-account__select-all > input");
    if (checkbox) await checkbox.click({ clickCount: 2 });
  }
  const button = await page.waitForSelector("button.button.btn-primary", { timeout: 3000 });
  if (button) await button.click();

  const connectButton = await page.waitForSelector("button.button.btn-primary", { timeout: 3000 });
  if (connectButton) await connectButton.click();
}

export async function getShares(page: puppeteer.Page) {
  await page.waitForSelector("#sharesDisplay");
  const sharesInnerText = await page.evaluate('document.querySelector("#sharesDisplay").innerText');
  return getAfterColon(sharesInnerText);
}

export async function awaitUpdateShares(page: puppeteer.Page, initialShares: BigNumber) {
  console.log(initialShares);
  await page.waitForFunction(
    `!document.querySelector("#sharesDisplay").innerText.includes("${initialShares.dp(5).toString()}")`
  );
  return (await getShares(page)) || "";
}

export async function switchAccounts(
  metamask: dappeteer.Dappeteer,
  page: puppeteer.Page,
  acct: number,
  signDisclaimer: boolean
) {
  await metamask.switchAccount(acct);
  await page.bringToFront();
  if (signDisclaimer) {
    // quickConnectWallet(page);
    await metamask.page.bringToFront();
    await approveTransactions(metamask, page, 1);
  }
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
  // await page.waitForSelector("#executeStake");
  // await page.waitForFunction("document.querySelector('#executeStake').innerText === 'Stake'");
  // await page.waitForTimeout(500);
  // await page.click("#executeStake");
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
