import puppeteer from 'puppeteer';
import * as dappeteer from '@keithers98/dappeteer-stable';
import 'regenerator-runtime/runtime';
import BigNumber from 'bignumber.js';
import { IMaxEval, BalancePos, ITxType, LocalStorageMethods, screenSize } from '../utils/types';
export const testAcctId = '0x867A6D38D30C4731c85bF567444F8CF22885DfAd';
BigNumber.config({ DECIMAL_PLACES: 18, ROUNDING_MODE: BigNumber.ROUND_DOWN, EXPONENTIAL_AT: 18 });

function toFixed3(value: any): string {
  if (!value) return '';
  try {
    return value.toString().match(/^-?\d+(?:\.\d{0,3})?/)[0];
  } catch (error) {
    console.error('Invalid Input, may be undefined', error);
    return 'Invalid Input, may be undefined';
  }
}

export async function closeBrowser(browser: puppeteer.Browser) {
  try {
    await browser.close();
  } catch (error) {
    console.error(error);
  }
}
export async function setupPuppBrowser() {
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  try {
    browser = await puppeteer.launch({ headless: false, timeout: 8000 });
    page = await browser.newPage();
    await page.goto('http://localhost:3000/');
    return { page, browser };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * This function will recursively try to sign the disclaimer, considering the current issue with the popup being closed automatically.
 * @param metamask
 * @param page
 */

export async function forceSignDisclaimer(metamask: dappeteer.Dappeteer, page: puppeteer.Page) {
  await page.bringToFront();
  try {
    await quickConnectWallet(page);
    try {
      if (await page.waitForSelector('#d-view-txs-btn', { timeout: 500 })) return;
    } catch (error) {
      console.error('Disclaimer needs signed.');
    }
    await page.waitForSelector('#sign-disclaimer-btn', { timeout: 1500 });
    await page.click('#sign-disclaimer-btn');
    await metamask.sign();
    await page.bringToFront();
    await page.waitForSelector('#d-view-txs-btn', { timeout: 500 });
  } catch (error) {
    await forceSignDisclaimer(metamask, page);
  }
}

export async function setupDappBrowser(acct2: boolean = false) {
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;
  // console.log('wsEndpoint Variable:', process.env.PUPPETEER_WS_ENDPOINT);

  try {
    browser = await dappeteer.launch(puppeteer, {
      metamaskVersion: 'v10.8.1',
      headless: false,
      timeout: 5000,
    });

    console.info('wsEndpoint Variable:', process.env.PUPPETEER_WS_ENDPOINT);

    console.info(
      `Setting up metamask with creds: \n Password: ${process.env.REACT_APP_T_ACCT_PASS} \n Seed: ${process.env.REACT_APP_T_ACCT_SEED}`
    );

    metamask = await dappeteer.setupMetamask(browser, {
      seed: process.env.REACT_APP_T_ACCT_SEED,
      password: process.env.REACT_APP_T_ACCT_PASS,
    });

    if (acct2 && process.env.REACT_APP_T_ACCT2_PK && process.env.REACT_APP_T_ACCT_PASS) {
      console.info('Importing Account Two');
      await metamask.importPK(process.env.REACT_APP_T_ACCT2_PK);
      await metamask.switchAccount(1);
    }

    await metamask.switchNetwork('rinkeby');

    page = await browser.newPage();
    await page.goto('http://localhost:3000/');
    return { page, browser, metamask };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function quickConnectWallet(page: puppeteer.Page) {
  await page.waitForSelector('#d-wallet-button');
  await page.click('#d-wallet-button');
  await page.waitForSelector('.sc-hKwDye.Klclp.web3modal-provider-container');
  await page.waitForTimeout(200);
  await page.click('.sc-hKwDye.Klclp.web3modal-provider-container');
}

export async function setupDataX(
  page: puppeteer.Page,
  metamask: dappeteer.Dappeteer,
  network: string,
  mobile: boolean,
  acct2?: boolean
) {
  expect(page).toBeDefined();
  mobile ? await page.setViewport({ width: 360, height: 740 }) : await page.setViewport({ width: 1400, height: 913 });
  await metamask.switchNetwork(network);
  if (acct2 && process.env.REACT_APP_T_ACCT2_PK) {
    console.log('Importing Account Two');
    await metamask.importPK(process.env.REACT_APP_T_ACCT2_PK);
    await metamask.switchAccount(1);
  }
  await page.bringToFront();
  await quickConnectWallet(page);

  try {
    // Confirm Connection in MetaMaks
    await approve(metamask.page, true);
    await approve(metamask.page, true);
  } catch (error) {
    console.log('Coudnt connect to site.');
  }

  await forceSignDisclaimer(metamask, page);
  await page.bringToFront();
  const btnText = await page.evaluate("document.querySelector('#d-view-txs-btn').innerText");
  expect(btnText).toBe('0x867...DfAd');
}

/**
 * Imports token to MM wallet, defaults to ocean.
 *
 * @param metamask - dappeteer
 * @param symbol - DT symbol
 */

export async function importTokens(metamask: dappeteer.Dappeteer, symbol?: string, chainId: number = 4) {
  // rinkeby
  const ocean = '0x8967BCF84170c91B0d24D4302C2376283b0B3a07';
  const sagkri = '0x1d0c4f1dc8058a5395b097de76d3cd8804ef6bb4';
  const dazorc = '0x8d2da54a1691fd7bd1cd0a242d922109b0616c68';
  const zeasea = '0xcf6823cf19855696d49c261e926dce2719875c3d';
  // polygon
  const matic = '0x867A6D38D30C4731c85bF567444F8CF22885DfAd';
  const mOcean = '0x282d8efCe846A88B159800bd4130ad77443Fa1A1';
  await clearMMPopup(metamask);
  if (chainId === 4) {
    switch (symbol) {
      case 'SAGKRI-94':
        await metamask.addToken(sagkri);
        break;
      case 'DAZORC-13':
        await metamask.addToken(dazorc);
        break;
      case 'ZEASEA-66':
        await metamask.addToken(zeasea);
        break;
      default:
        await metamask.addToken(ocean);
        break;
    }
  } else if (chainId === 137) {
    switch (symbol) {
      case 'mOCEAN':
        await metamask.addToken(mOcean);
        break;
      default:
        await metamask.addToken(matic);
        break;
    }
  }
  await metamask.page.waitForSelector('.asset-breadcrumb');
  await metamask.page.click('.asset-breadcrumb');
  const assets: puppeteer.JSHandle | undefined = await useXPath(metamask.page, 'button', 'Assets', false);
  // @ts-ignore
  await assets.click();
}

export async function clearMMPopup(metamask: dappeteer.Dappeteer) {
  // clear popoups
  // maybe use useXPath to find an X? could be better
  try {
    await metamask.page.waitForSelector('.fas.fa-times.popover-header__button', { timeout: 1000 });
    await metamask.page.click('.fas.fa-times.popover-header__button');
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
  sibling?: 'prev' | 'next',
  metamask?: dappeteer.Dappeteer
) {
  // might be better to use * instead of el in the future, to ensure this works even if the element changes
  // if( (page instanceof puppeteer.Page) === false ) page === page.page
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
      await importTokens(metamask, elText);
      await page.waitForFunction(query, { timeout: 5000 });
      handle = await metamask.page.$x(xpath);
    } else {
      throw error;
    }
  }
  if (handle) {
    switch (sibling) {
      case 'prev':
        return await page.evaluateHandle((el) => el.previousElementSibling, handle[0]);
      case 'next':
        return await page.evaluateHandle((el) => el.nextSibling, handle[0]);
      default:
        return handle[0];
    }
  } else {
    throw new Error("Couldn't get element handle");
  }
}

export async function getSelectedTokens(page: puppeteer.Page, pos: 1 | 2 | 3) {
  let currentT1: string, currentT2: string;
  try {
    const t1Handle = await page.waitForSelector('#selectedToken1', { timeout: 3000 });
    currentT1 = (await (await t1Handle?.getProperty('innerText'))?.jsonValue()) || '';
  } catch (error) {
    currentT1 = '';
  }
  if (pos === 1) return currentT1;

  try {
    const t2Handle = await page.waitForSelector('#selectedToken2', { timeout: 3000 });
    currentT2 = (await (await t2Handle?.getProperty('innerText'))?.jsonValue()) || '';
  } catch (error) {
    currentT2 = '';
  }
  if (pos === 2) return currentT2;

  return { currentT1, currentT2 };
}

export async function unlockTokens(page: puppeteer.Page, metamask: dappeteer.Dappeteer, amount: 'perm' | 'once') {
  await page.waitForSelector('#perm-unlock-btn');
  await page.waitForSelector('#unlock-once-btn');

  if (amount === 'perm') {
    await page.click('#perm-unlock-btn');
  } else {
    await page.click('#unlock-once-btn');
  }

  await metamask.confirmTransaction();
}

export async function swapTokens(page: puppeteer.Page) {
  await page.bringToFront();
  const t1Bal = await getBalanceInDapp(page, 1);
  const t2Bal = await getBalanceInDapp(page, 2);

  // swap tokens
  await page.waitForSelector('#swapTokensBtn');
  await page.click('#swapTokensBtn');

  await page.waitForFunction(`document.querySelector("#token1-balance").innerText.includes("${t2Bal}")`);
  await page.waitForFunction(`document.querySelector("#token2-balance").innerText.includes("${t1Bal}")`);
  expect(t1Bal).toBe(await getBalanceInDapp(page, 2));
  expect(t2Bal).toBe(await getBalanceInDapp(page, 1));
}

export async function selectToken(page: puppeteer.Page, symbol: string, pos: number) {
  // open modal for token pos
  try {
    await page.waitForSelector(`#selectToken${pos} > #selectTokenBtn`, { timeout: 1200 });
    await page.waitForFunction(
      `document.querySelector('#selectToken${pos} > #selectTokenBtn').innerText === "Select Token"`
    );
    await page.waitForTimeout(1000);
    await page.click(`#selectToken${pos}`);
    // click token
    await page.waitForSelector(`#${symbol}-btn`);
    await page.waitForTimeout(500);
    await page.click(`#${symbol}-btn`);
  } catch (error) {
    const selectedToken = await page.waitForSelector(`#selectedToken${pos}`, { timeout: 1200 });
    const text = await (await selectedToken?.getProperty('innerText'))?.jsonValue();

    // @ts-ignore
    if (text !== symbol) {
      await page.waitForTimeout(1000);
      await page.click(`#selectedToken${pos}`);
      // click token
      await page.waitForSelector(`#${symbol}-btn`);
      await page.waitForTimeout(500);
      await page.click(`#${symbol}-btn`);
      await page.waitForFunction(`document.querySelector('#selectedToken${pos}').innerText === "${symbol}"`);
    }
  }
}

export async function awaitTokenSelect(page: puppeteer.Page, symbol: string, pos: number) {
  await page.waitForSelector(`#selectedToken${pos}`);
  await page.waitForFunction(`document.querySelector('#selectedToken${pos}').innerText === "${symbol}"`);
}

export async function swapOrSelect(page: puppeteer.Page, t1Symbol: string, t2Symbol: string) {
  await page.bringToFront();

  const currentT1 = await getSelectedTokens(page, 1);
  const currentT2 = await getSelectedTokens(page, 2);

  if (currentT1 && currentT2 && t1Symbol === currentT2 && t2Symbol === currentT1) {
    await swapTokens(page);
    return;
  } else if (currentT1 && t2Symbol === currentT1) {
    await swapTokens(page);
  } else if (currentT2 && t1Symbol === currentT2) {
    await swapTokens(page);
  }

  if (!currentT1 || t1Symbol !== currentT1) {
    await selectToken(page, t1Symbol, 1);
  }

  if (!currentT2 || t2Symbol !== currentT2) {
    await selectToken(page, t2Symbol, 2);
  }

  await awaitTokenSelect(page, t1Symbol, 1);
  await awaitTokenSelect(page, t2Symbol, 2);
}

export async function approveTransactions(metamask: dappeteer.Dappeteer, page: puppeteer.Page, txAmount: number) {
  // open MM
  await metamask.page.bringToFront();
  const activity = await useXPath(metamask.page, 'button', 'Activity', false);
  // @ts-ignore
  await activity.click();
  for (let tx = 0; tx < txAmount; tx++) {
    // wait for tx, click and confirm
    try {
      await clearMMPopup(metamask);
      await metamask.page.waitForSelector('.home__container');
      await metamask.page.waitForSelector('li[data-testid=home__activity-tab] > button');
      await metamask.page.click('li[data-testid=home__activity-tab] > button');
      await metamask.page.waitForSelector('.transaction-status.transaction-status--unapproved');
      await metamask.page.reload();
      await metamask.page.waitForSelector('.btn-primary');
      await metamask.confirmTransaction();
    } catch (error) {
      console.error(error);
    }
  }
}

export async function clickMaxTrade(page: puppeteer.Page) {
  await page.bringToFront();
  await page.waitForFunction('document.querySelector("#maxBtn[disabled]") === null');
  await page.waitForSelector('#maxBtn');
  await page.click('#maxBtn');
  await page.waitForFunction('Number(document.querySelector("#token1-input").value) > 0', { timeout: 8000 });
}

export async function typeAmount(
  page: puppeteer.Page,
  amount: string,
  pos: number,
  t1Symbol: string,
  t2Symbol: string,
  increment: boolean = true
) {
  const otherPos = pos === 1 ? 2 : 1;
  const currentInput = await page.evaluate(`document.querySelector("#token${otherPos}-input").value`);
  await page.waitForSelector(`#token${pos}-input`);
  await page.click(`#token${pos}-input`);
  await page.waitForTimeout(500);
  await page.type(`#token${pos}-input`, amount);
  if (Number(currentInput) > 0) {
    await page.waitForFunction(
      `Number(document.querySelector("#token${otherPos}-input").value) !== "${currentInput}"`,
      {
        timeout: 8000,
      }
    );
  } else if (Number(amount) > 0) {
    await page.waitForFunction(`Number(document.querySelector("#token${otherPos}-input").value) > 0`, {
      timeout: 8000,
    });
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

  if (amount === 'max') {
    await clickMaxTrade(page);
  } else {
    await typeAmount(page, amount, inputLoc, t1Symbol, t2Symbol);
    if (amount === '0') return;
  }

  const t1Bal = new BigNumber(await getBalanceInDapp(page, 1));

  // get max values for each token and value in input field
  const { t1Max, t2Max, t1Input, t2Input } = await evaluateMax(page, t1Bal);

  // test decimals limited to 5
  const afterPeriod = /\.(.*)/;
  const t1Decimals = t1Input.toString().match(afterPeriod);
  const t2Decimals = t2Input.toString().match(afterPeriod);
  if (t1Decimals) expect(t1Decimals[1].length).toBeLessThanOrEqual(5);
  if (t2Decimals) expect(t2Decimals[1].length).toBeLessThanOrEqual(5);

  // test max limits inputs
  expect(t1Max.toNumber()).toBeGreaterThanOrEqual(t1Input.toNumber());
  expect(t2Max.toNumber()).toBeGreaterThanOrEqual(t2Input.toNumber());
  if (t1Input.lt(t1Max)) expect(t2Max.gt(t2Input)).toBeTruthy();

  // check value in percent field, balance field, and input field
  const balance = new BigNumber(await getBalanceInMM(metamask, t1Symbol));
  await page.bringToFront();

  // perc should have no decimals, be greater than 0, should be correct
  await page.waitForSelector('#token1-perc-input');

  const percApprox: BigNumber = t1Input.div(balance).times(100).dp(3);

  let perc;
  if (percApprox.gt(0)) {
    await page.waitForFunction('Number(document.querySelector("#token1-perc-input").value) > 0', { timeout: 3000 });
    perc = await getPercInDapp(page);
    expect(perc.toNumber()).toBeGreaterThan(0);
    percApprox.gt(100) ? expect(perc.toString()).toEqual('100') : expect(Number(perc)).toBeCloseTo(percApprox.toNumber());
  }
}

export async function getPercInDapp(page: puppeteer.Page) {
  return new BigNumber(await page.evaluate('document.querySelector("#token1-perc-input").value'));
}

export async function evaluateMax(page: puppeteer.Page, t1Bal: BigNumber): Promise<IMaxEval> {
  // get max values for each token
  await page.waitForSelector('[data-test-max]');
  await page.waitForSelector('[data-test-max]');
  const t1Max: BigNumber = new BigNumber(
    await page.evaluate('document.querySelectorAll("[data-test-max]")[0].getAttribute("data-test-max")')
  );
  const t2Max: BigNumber = new BigNumber(
    await page.evaluate('document.querySelectorAll("[data-test-max]")[1].getAttribute("data-test-max")')
  );

  // get values in each input field
  let t1Input: BigNumber = new BigNumber(await page.evaluate('document.querySelector("#token1-input").value'));
  let t2Input: BigNumber = new BigNumber(await page.evaluate('document.querySelector("#token2-input").value'));

  if (t1Input.isNaN()) t1Input = new BigNumber(0);
  if (t2Input.isNaN()) t2Input = new BigNumber(0);

  let limit: 'max' | 'bal';

  if (t1Input.eq(t1Bal)) {
    limit = 'bal';
  } else {
    limit = 'max';
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
  const t1val = new BigNumber(await page.evaluate('document.querySelector("#token1-input").value'));
  const t2val = new BigNumber(await page.evaluate('document.querySelector("#token2-input").value'));
  let amountBN = new BigNumber(amount);
  const t1Limit = t1Symbol === 'OCEAN' ? 0.01 : 0.001;
  const t2Limit = t2Symbol === 'OCEAN' ? 0.01 : 0.001;
  if (t1val.lt(t1Limit) || t2val.lt(t2Limit)) {
    amountBN = amountBN.plus(0.5);
    await clearInput(page, `#token${inputPos}-input`);
    await page.click(`#token${inputPos}-input`);
    await page.waitForTimeout(500);
    await page.type(`#token${inputPos}-input`, amountBN.dp(5).toString());
    await incrementUntilValid(page, amountBN.dp(5).toString(), t1Symbol, t2Symbol, inputPos);
  }
}

/**
 * Sets an input field to be an empty string.
 * @param page
 * @param elID Element id with # included.
 */

export async function clearInput(page: puppeteer.Page, elID: string) {
  const input = await page.waitForSelector(elID);
  await input?.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  // await page.evaluate(`() => document.querySelector("${elID}").value = ""`);
  // await page.waitForFunction(`() => document.querySelector("${elID}").value === ""`);
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
  t1Symbol: string = 'OCEAN'
) {
  const t1Bal = await getBalanceInMM(metamask, t1Symbol);
  // @ts-ignore
  await assertTo3(page, t1Bal, 'token1-balance', 1, updating);
  if (t2Symbol) {
    const t2Bal = await getBalanceInMM(metamask, t2Symbol);
    // @ts-ignore
    await assertTo3(page, t2Bal, 'token2-balance', 2, updating);
  }
  await page.bringToFront();
}
/**
 * Asserts truth to match dapp element value to 3 decimal places.
 * @param page - puppeteer page (dapp)
 * @param truth - source of truth to asser against (will be coerced to num)
 * @param id - id in dapp to check against (dont include #)
 */

async function assertTo3(page: puppeteer.Page, truth: string | number, id: string, pos: BalancePos, updating: boolean) {
  await page.bringToFront();
  id = `#${id}`;
  await page.waitForSelector(id);
  const dappBal = await getBalanceInDapp(page, pos);
  expect(Number(toFixed3(dappBal))).toBeCloseTo(Number(toFixed3(truth)), 3);
}

/**
 * Get balance for token entered from MM
 * @param metamask
 * @param symbol
 * @return string of balance
 */

export async function getBalanceInMM(
  metamask: dappeteer.Dappeteer,
  symbol: string,
  chainId: number = 4
): Promise<string> {
  await metamask.page.bringToFront();
  const assets: puppeteer.JSHandle | undefined = await useXPath(metamask.page, 'button', 'Assets', false);
  // @ts-ignore
  await assets.click();
  const tokenBalHandle = await useXPath(metamask.page, 'span', symbol, false, true, 'prev', metamask);
  if (tokenBalHandle) {
    const innerTextHandle = await tokenBalHandle.getProperty('innerText');
    const innerText = await innerTextHandle.jsonValue();
    // @ts-ignore
    return innerText;
  }
  throw new Error('Couldnt get balance.');
}

const afterColon = /\s(.*)/;
const commas = /[,]/;
export function getAfterColon(value: string) {
  const match = value.match(afterColon);
  if (match) return match[1].replace(commas, '');
}

/**
 * Return balance for token entered from dapp
 * @param metamask
 * @param symbol
 * @return balance as a string
 */

export async function getBalanceInDapp(page: puppeteer.Page, pos: BalancePos): Promise<number> {
  await page.bringToFront();
  let balance;
  await page.waitForSelector(`#token${pos}-balance`);
  balance = await page.evaluate(`document.querySelector("#token${pos}-balance").innerText`);
  const match = balance.match(afterColon);
  const number = match[1].replace(commas, '');
  balance = Number(number);
  return balance;
}

/**
 * Gets the execute button text for assertions.
 * @param page
 * @param txType
 * @param text - Will wait for the button text to contain this text if supplied.
 * @returns
 */

export async function getExecuteButtonText(page: puppeteer.Page, txType: ITxType, text?: string | string[]) {
  switch (txType) {
    case 'stake':
      await page.waitForSelector('#executeStake');
      if (text && !Array.isArray(text)) {
        await page.waitForFunction(`document.querySelector("#executeStake").innerText.includes("${text}")`, {
          timeout: 2500,
        });
      } else if (text && Array.isArray(text)) {
        await page.waitForFunction(
          ` document.querySelector("#executeStake").innerText.includes("${text[0]}") || document.querySelector("#executeStake").innerText.includes("${text[1]}")`,
          {
            timeout: 2500,
          }
        );
      }
      return await page.evaluate('document.querySelector("#executeStake").innerText');
    case 'unstake':
      await page.waitForSelector('#executeUnstake');
      if (text) {
        await page.waitForFunction(`document.querySelector("#executeUnstake").innerText.includes("${text}")`, {
          timeout: 2500,
        });
      }
      return await page.evaluate('document.querySelector("#executeUnstake").innerText');
    default:
      await page.waitForSelector('#executeTradeBtn');
      if (text) {
        await page.waitForFunction(`document.querySelector("#executeTradeBtn").innerText.includes("${text}")`, {
          timeout: 2500,
        });
      }
      return await page.evaluate('document.querySelector("#executeTradeBtn").innerText');
  }
}

export async function executeTransaction(
  page: puppeteer.Page,
  metamask: dappeteer.Dappeteer,
  txType: ITxType,
  unlock: 'perm' | 'once' = 'once'
) {
  await page.bringToFront();
  let btnHandle: puppeteer.JSHandle | null;
  switch (txType) {
    case 'stake':
      await page.waitForSelector('#executeStake');
      btnHandle = await page.$('#executeStake');
      await page.waitForFunction(
        'document.querySelector("#executeStake").innerText === "Stake" || document.querySelector("#executeStake").innerText.includes("Unlock")'
      );
      break;
    case 'unstake':
      await page.waitForSelector('#executeUnstake');
      btnHandle = await page.$('#executeUnstake');
      await page.waitForFunction('document.querySelector("#executeUnstake").innerText !== "Enter Amount to Remove"');
      break;
    default:
      await page.waitForSelector('#executeTradeBtn');
      btnHandle = await page.$('#executeTradeBtn');
  }

  if (btnHandle) {
    const innerTextHandle = await btnHandle.getProperty('innerText');
    const innerText: string = await innerTextHandle.jsonValue();

    // @ts-ignore
    await btnHandle.click();
    if (innerText.includes('Unlock')) {
      await unlockTokens(page, metamask, unlock);
      if (txType === 'swap') {
        await confirmSwapModal(page, metamask);
      } else {
        // console.log("recalling execute transaction");
        // await executeTransaction(page, metamask, txType, unlock);
      }
      await metamask.page.bringToFront();
    } else {
      if (txType === 'swap') await confirmSwapModal(page, metamask);
      await metamask.page.bringToFront();
    }
  }
}

export async function confirmSwapModal(page: puppeteer.Page, metamask: dappeteer.Dappeteer) {
  await page.bringToFront();

  await page.waitForSelector('#confirmSwapModalBtn');
  await page.click('#confirmSwapModalBtn');

  await metamask.page.bringToFront();
  await metamask.page.bringToFront();
  await metamask.page.bringToFront();
  await metamask.page.bringToFront();
  await metamask.page.bringToFront();
  // find and return the approval amount
  // await page.waitForSelector("#confirmItem");
  // const confirmations = await page.evaluate('document.querySelectorAll("#confirmItem").length');
  // return confirmations;
}

export async function navToStake(page: puppeteer.Page) {
  await page.bringToFront();
  await page.waitForSelector('#Stake-link');
  await page.click('#Stake-link');
}

export async function navToLp(page: puppeteer.Page) {
  await navToStake(page);
  await page.waitForSelector('#lpLink');
  await page.click('#lpLink');
  await page.waitForSelector('#lpModal');
}

export async function navToTrade(page: puppeteer.Page) {
  await page.bringToFront();
  await page.waitForSelector('#Trade-link');
  await page.click('#Trade-link');
}
export async function closeConfirmSwapModal(page: puppeteer.Page) {
  const button = await page.waitForSelector('#closeConfrimSwapModalbtn');
  await button?.click();
}

export async function selectOrImportPool(page: puppeteer.Page, pool: string, select: boolean) {
  try {
    await page.waitForSelector(`#${pool}-lp-item`, { timeout: 3000 });
  } catch (error) {
    await importStakeInfo(page, pool);
    await page.waitForSelector(`#${pool}-lp-item`, { timeout: 3000 });
  }
  await page.click(`#${pool}-lp-item`);
}

export async function selectRemoveStakeButton(page: puppeteer.Page) {
  await page.waitForSelector('#yourShares');
  const shares = new BigNumber(await page.evaluate('document.querySelector("#yourShares").innerText'));
  await page.waitForSelector('#lp-remove-link');
  await page.click('#lp-remove-link');
  await page.waitForSelector('#removeStakeModal');
  return shares;
}

export async function navToRemoveStake(page: puppeteer.Page, pool: string) {
  await navToLp(page);
  await selectOrImportPool(page, pool, true);
  return await selectRemoveStakeButton(page);
}

export async function navToStakeWPool(page: puppeteer.Page, pool: string) {
  selectOrImportPool(page, pool, true);
  await page.waitForSelector('#lp-add-link');
  await page.click('#lp-add-link');
  await page.waitForSelector('#stakeModal');
}

export async function navToLpFromUnstake(page: puppeteer.Page) {
  await page.waitForSelector('#remove-lp-link');
  await page.click('#remove-lp-link');
  await page.waitForSelector('#lpModal');
}

export async function navToTradeXFromLanding(page: puppeteer.Page) {
  const enterDapp = await page.waitForSelector('#enterDappLink');
  await enterDapp?.click();
  await page.waitForSelector('#swapModal');
}

export async function acceptCookies(page: puppeteer.Page) {
  await page.waitForSelector('#cookiesModal');
  await page.waitForSelector('#confirmCookies');
  await page.click('#confirmCookies');
  await page.waitForTimeout(500);
}

export async function goToLocalHost(page: puppeteer.Page, screenSize: screenSize = 'desktop') {
  await page.goto('http://localhost:3000');
  await page.setViewport({ width: 1400, height: 913 });
}

export async function setupUnstake(page: puppeteer.Page, unstakeAmt: string, initialShares?: BigNumber) {
  await page.waitForSelector('#executeUnstake[disabled]');

  await selectToken(page, 'OCEAN', 1);
  await page.waitForFunction('document.querySelector("#executeUnstake").innerText === "Enter Amount to Remove"');
  // check btn text and btn is disabled
  await page.$('#executeUnstake[disabled]');

  // wait 6s max for loading lp to dissapear
  await page.waitForFunction('document.querySelector("#loading-lp") === null', { timeout: 6000 });

  const sharesString = await getSharesFromUnstake(page);

  let shares;
  if (sharesString) {
    shares = new BigNumber(sharesString);
  } else {
    throw new Error('Couldnt get shares');
  }

  if (initialShares && shares) {
    expect(initialShares.toNumber()).toBeCloseTo(shares.toNumber());
  }

  await inputUnstakeAmt(page, unstakeAmt, sharesString);
}

export async function inputUnstakeAmt(page: puppeteer.Page, unstakeAmt: string, shares: string) {
  let receive: string, input: string;

  if (unstakeAmt === 'max') {
    await page.waitForSelector('#maxUnstakeBtn');
    await page.waitForFunction('document.querySelector("#maxUnstakeBtn[disabled]") === null');
    await page.click('#maxUnstakeBtn');
    await page.waitForSelector('#unstakeAmtInput');
    await page.waitForFunction('Number(document.querySelector("#unstakeAmtInput").value) > 0');
    input = await page.evaluate('document.querySelector("#unstakeAmtInput").value');
    await page.waitForSelector('#token1-input');
    await page.waitForFunction('Number(document.querySelector("#token1-input").value) > 0');
    receive = await page.evaluate('document.querySelector("#token1-input").value');
  } else {
    await page.waitForSelector('#unstakeAmtInput');
    await page.type('#unstakeAmtInput', unstakeAmt, { delay: 150 });
    await page.waitForSelector('#token1-input');
    if (Number(shares) > 0) await page.waitForFunction('Number(document.querySelector("#token1-input").value) > 0');
    receive = await page.evaluate('Number(document.querySelector("#token1-input").value)');
    input = await page.evaluate('document.querySelector("#unstakeAmtInput").value');
  }

  return { receive, input };
}

export async function approve(page: puppeteer.Page, selectAll: boolean = false): Promise<void> {
  await page.bringToFront();
  await page.reload();

  try {
    if (selectAll) {
      const checkbox = await page.waitForSelector('.permissions-connect-choose-account__select-all > input', {
        timeout: 3000,
      });
      if (checkbox) await checkbox.click({ clickCount: 2 });
    }
  } catch (error) {
    console.log('Couldnt select all, maybe there is only one available.');
  }

  const button = await page.waitForSelector('button.button.btn-primary', { timeout: 3000 });
  if (button) await button.click();

  const connectButton = await page.waitForSelector('button.button.btn-primary', { timeout: 3000 });
  if (connectButton) await connectButton.click();
}

export async function getSharesFromUnstake(page: puppeteer.Page) {
  await page.waitForSelector('#sharesDisplay');
  await page.waitForFunction("document.querySelector('#sharesDisplay').innerText !== '. . .'");
  const sharesInnerText = await page.evaluate('document.querySelector("#sharesDisplay").innerText');
  return getAfterColon(sharesInnerText);
}

/**
 * Waits for shares in unstake page to not equal the shares value passed.
 * @param page
 * @param initialShares old shares value
 * @returns
 */

export async function awaitUpdateShares(page: puppeteer.Page, initialShares: BigNumber) {
  await page.waitForFunction(
    `!document.querySelector("#sharesDisplay").innerText.includes("${initialShares.dp(5).toString()}")`
  );
  return (await getSharesFromUnstake(page)) || '';
}

/**
 * Switches metamask accounts.
 *
 * @param metamask
 * @param page
 * @param acct The index of the account to be selected, not 0 indexed. (1 will select the first account in the list, and so on.)
 * @param signDisclaimer Will sign the disclaimer in metamask if true is supplied.
 */

export async function switchAccounts(
  metamask: dappeteer.Dappeteer,
  page: puppeteer.Page,
  acct: number,
  signDisclaimer: boolean
) {
  console.info('switching accounts: ' + acct);
  await metamask.switchAccount(acct);
  await page.bringToFront();
  if (signDisclaimer) {
    await forceSignDisclaimer(metamask, page);
  }
}

/**
 * Selects a stake pool by token symbol supplied.
 * @param page
 * @param stakeToken token symbol, case sensitive
 */

export async function selectStakeToken(page: puppeteer.Page, stakeToken: string) {
  // selectToken
  await page.waitForSelector('#stakeSelectBtn');
  await page.click('#stakeSelectBtn');
  await page.waitForSelector(`#${stakeToken}-btn`);
  await page.click(`#${stakeToken}-btn`);
  await page.waitForSelector('#stakeToken');
  await page.waitForFunction(`document.querySelector('#stakeToken').innerText === "${stakeToken}"`);
  await page.waitForSelector('#swapRate');
  await page.waitForSelector('#poolLiquidity');
  await page.waitForSelector('#yourLiquidity');
}

/**
 * Inputs value to stake.
 *
 * @param page
 * @param stakeAmt A number in string format or 'max'
 * @returns The input amount after max calculation.
 */

export async function inputStakeAmt(page: puppeteer.Page, stakeAmt: string, pos: 1 | 2): Promise<string> {
  const origionalAmount = await page.evaluate(`document.querySelector("#token${pos}-input").value`);

  if (stakeAmt === 'max') {
    await page.waitForSelector('#maxBtn');
    await page.click('#maxBtn');
    await page.waitForSelector(`#token${pos}-input`);
    await page.waitForFunction(`Number(document.querySelector("#token${pos}-input").value) > 0`);
  } else {
    await page.waitForSelector(`#token${pos}-input`);
    await page.type(`#token${pos}-input`, stakeAmt, { delay: 150 });
    await page.waitForFunction(
      `Number(document.querySelector("#token${pos}-input").value) !== Number(${origionalAmount})`
    );
  }
  return await page.evaluate(`document.querySelector("#token${pos}-input").value`);
}

export async function setUpStake(page: puppeteer.Page, stakeToken: string, stakeAmt: string) {
  // open token modal
  await selectToken(page, stakeToken, 2);
  await selectToken(page, 'OCEAN', 1);
  await page.waitForTimeout(1000);
  await inputStakeAmt(page, stakeAmt, 1);
}

export async function assertToken(page: puppeteer.Page, symbol:string, pos: 1|2) {
  await page.waitForSelector(`#selectedToken${pos}`);
  const text = await page.evaluate(`document.querySelector("#selectedToken${pos}").innerText`);
  expect(text).toBe(symbol);
}

export async function confirmAndCloseTxDoneModal(page: puppeteer.Page, timeout: number = 120000) {
  await page.bringToFront();
  await page.waitForSelector('#transactionDoneModal', { timeout });
  await page.waitForSelector('#txDoneModalCloseBtn');
  await page.click('#txDoneModalCloseBtn');
}

export async function confirmTokensClearedAfterTrade(page: puppeteer.Page) {
  await page.bringToFront();
  await page.waitForFunction('document.querySelectorAll("#selectTokenBtn").length === 2');
}

export async function confirmInputClearedAfterStake(page: puppeteer.Page) {
  await page.waitForSelector('#executeStake');
  await page.waitForFunction("document.querySelector('#executeStake').innerText === 'Select a Token'", {
    timeout: 3000,
  });
  await page.waitForSelector('#token1-input');
  await page.waitForFunction("document.querySelector('#token1-input').value === ''", { timeout: 3000 });
}

export async function confirmInputClearedAfterUnstake(page: puppeteer.Page) {
  await page.waitForSelector('#executeUnstake');
  await page.waitForFunction('document.querySelector("#executeUnstake").innerText === "Enter Amount to Remove"');
  await page.waitForSelector('#unstakeAmtInput');
  await page.waitForFunction('document.querySelector("#unstakeAmtInput").value === "0"');
}

export async function reloadOrContinue(lastTestPassed: Boolean, page: puppeteer.Page, stake?: boolean) {
  if (lastTestPassed) return;
  page.reload();
  await page.setViewport({ width: 1400, height: 913 });
  await quickConnectWallet(page);
  if (stake) navToStake(page);
}

// get method not fully functional
export async function useLocalStorage(
  page: puppeteer.Page,
  method: LocalStorageMethods,
  data?: { key?: string; value?: string; index?: number }
) {
  switch (method) {
    case 'get':
      if (data) {
        return await page.evaluate((data, testAcctId) => window.localStorage.getItem(data.key || ''), data, testAcctId);
      }
      break;
    case 'set':
      if (data) await page.evaluate((data) => window.localStorage.setItem(data.key || '', data.value || ''), data);
      break;
    case 'clear':
      await page.evaluate(() => window.localStorage.clear());
      break;
    case 'key':
      if (data) await page.evaluate((data) => window.localStorage.key(data.index || 0), data);
      break;
    case 'length':
      return await page.evaluate(() => window.localStorage.length);
    case 'remove':
      if (data) await page.evaluate((data) => window.localStorage.removeItem(data.key || ''), data);
      break;
  }
}

export async function importStakeInfo(page: puppeteer.Page, pool: string) {
  await page.waitForSelector('#importStakeBtn');
  await page.click('#importStakeBtn');
  await page.waitForTimeout(1500);
  await page.waitForSelector(`#${pool}-btn`);
  await page.click(`#${pool}-btn`);
}

// not yet tested
export async function hoarder(
  browser: puppeteer.Browser,
  metamask: dappeteer.Dappeteer,
  dumpAcct: string,
  accounts: number
) {
  const context = browser.defaultBrowserContext();
  context.overridePermissions(metamask.page.url(), ['clipboard-read']);
  const oceanFaucet = await browser.newPage();
  const chainlinkFaucet = await browser.newPage();
  chainlinkFaucet.goto('https://faucets.chain.link/rinkeby');
  oceanFaucet.goto('https://faucet.rinkeby.oceanprotocol.com/send?address=0x7c8a5A7c34C8D9Bff143bEf41EaFfaAb8d543c87');
  metamask.page.bringToFront();
  for (let i = 0; i < accounts; i++) {
    await metamask.page.waitForSelector('.account-menu__icon');
    await metamask.page.click('.account-menu__icon');
    await metamask.page.waitForSelector('.account-menu__item account-menu__item--clickable');
    await metamask.page.click('.account-menu__item account-menu__item--clickable');
    await metamask.page.waitForSelector('.btn-primary');
    await metamask.page.click('.btn-primary');
    await metamask.page.waitForSelector('.selected-account__clickable');
    await metamask.page.click('.selected-account__clickable');
    await metamask.page.waitForTimeout(1000);
    const address = await metamask.page.evaluate(() => navigator.clipboard.readText());
    await oceanFaucet.bringToFront();
    await oceanFaucet.type('.selected-account__clickable', address);
    await oceanFaucet.click('#createBtn');
    await chainlinkFaucet.bringToFront();
    await chainlinkFaucet.waitForSelector('#accountAddress');
    await chainlinkFaucet.type(address, '#accountAddress');
    await chainlinkFaucet.waitForSelector('.recaptcha-checkbox-border');
    await chainlinkFaucet.click('.recaptcha-checkbox-border');
    await chainlinkFaucet.waitForTimeout(1500);
    await chainlinkFaucet.click('.Box-sc-1vpmd2a-0.Button-sc-1sg3lik-0.kaOPyJ');
  }
}
