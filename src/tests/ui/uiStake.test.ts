import puppeteer from 'puppeteer';
import * as dappeteer from '@keithers98/dappeteer-stable';
import 'regenerator-runtime/runtime';
import {
  setupDataX,
  closeBrowser,
  navToStake,
  getBalanceInMM,
  acceptCookies,
  getBalanceInDapp,
  inputStakeAmt,
  getExecuteButtonText,
  clearInput,
  navToTradeXFromLanding,
  switchAccounts,
  selectToken,
  goToLocalHost,
} from '../utils';
import BigNumber from 'bignumber.js';
describe('Stake Platform UI works as expected.', () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;
  let acc1DapBal: BigNumber, acc1MMBal: BigNumber, acc2MMbal: BigNumber, acc2DapBal: BigNumber;

  beforeAll(async () => {
    browser = global.browser;
    page = global.page;
    metamask = global.metamask;
    await goToLocalHost(page);
    await navToTradeXFromLanding(page);
    await navToStake(page);
    await acceptCookies(page);
    await setupDataX(page, metamask, 'rinkeby', false);
    await page.bringToFront();
    await selectToken(page, 'OCEAN', 1);
    acc1DapBal = new BigNumber(await getBalanceInDapp(page, 1));
    acc1MMBal = new BigNumber(await getBalanceInMM(metamask, 'OCEAN'));
    expect(acc1DapBal.toNumber()).toEqual(0);
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  it('Should have OCEAN balance > 0 to run these tests', async () => {
    const balance = await getBalanceInMM(metamask, 'OCEAN');
    await page.waitForFunction('document.querySelector("#loading-lp") === null');
    expect(Number(balance)).toBeGreaterThan(0);
  });

  it('Balance updates when connecting wallet', async () => {
    const newBalance = await getBalanceInDapp(page, 1);
    expect(acc1DapBal.toNumber()).toBeLessThan(newBalance);
    acc1DapBal = new BigNumber(newBalance);
  });

  it('Max button disabled before token is selected', async () => {
    expect(await page.waitForSelector('#maxBtn[disabled]', { timeout: 3000 })).toBeTruthy();
  });

  it('Pool information is empty before token is selected', async () => {
    expect(await page.$('#swapRate')).toBeNull();
    expect(await page.$('#poolLiquidity')).toBeNull();
    expect(await page.$('#yourLiquidity')).toBeNull();
  });

  it('Balance is same in dapp and MM', async () => {
    expect(acc1DapBal.toNumber()).toBeCloseTo(acc1MMBal.toNumber());
  });

  it('Stake button is disabled when no token is selected', async () => {
    expect(await page.waitForSelector('#executeStake[disabled]', { timeout: 1500 })).toBeTruthy();
    const text = await getExecuteButtonText(page, 'stake', 'Select a Token');
    expect(text).toBe('Select a Token');
  });

  // it("Stake button is disabled when input > balance", async () => {});

  it('Stake button is disabled when input = 0, and execute button says enter ocean amount', async () => {
    expect(await page.waitForSelector('#maxBtn[disabled]', { timeout: 3000 })).toBeTruthy();
    await selectToken(page, 'SAGKRI-94', 2);
    const text = await getExecuteButtonText(page, 'stake', 'Enter');
    expect(text).toBe('Enter Stake Amount');
  });

  it('Pool information loads when token is selected', async () => {
    expect(await page.waitForSelector('#swapRate', { timeout: 5000 })).toBeTruthy();
    expect(await page.waitForSelector('#poolLiquidity', { timeout: 5000 })).toBeTruthy();
    expect(await page.waitForSelector('#yourLiquidity', { timeout: 5000 })).toBeTruthy();
  });

  it('Max button is enabled when token is selected', async () => {
    // await selectToken(page, "OCEAN", 1)
    expect(await page.$('#maxBtn[disabled]')).toBeNull();
  });

  it('Stake button is enabled when input is > 0', async () => {
    await inputStakeAmt(page, '1', 1);
    const text = await getExecuteButtonText(page, 'stake', ['Unlock', 'Stake']);
    await page.waitForTimeout(1000);
    await page.waitForFunction('document.querySelector("#executeStake[disabled]") === null', { timeout: 1500 });
    // expect(text === "Unlock OCEAN" || text === "Stake").toBeTruthy();
    console.log(text);
  });

  it('Check transactions for less than .01 ocean are not allowed', async () => {
    await clearInput(page, '#token1-input');
    await page.waitForTimeout(1000);
    await inputStakeAmt(page, '.001', 1);
    await page.waitForSelector('#executeStake[disabled]');
    const btnText = await getExecuteButtonText(page, 'stake', 'Minimum');
    expect(btnText).toBe('Minimum Stake is .01 OCEAN');
  });

  it('Max stake should limit input when less than user balance', async () => {
    const input = await inputStakeAmt(page, 'max', 1);
    expect(Number(input)).toBeLessThan(Number(acc1DapBal));
  });

  it('OCEAN input should clear and balance should update when switching accounts', async () => {
    acc1MMBal = new BigNumber(await getBalanceInMM(metamask, 'OCEAN'));
    await switchAccounts(metamask, page, 2, true);
    await page.bringToFront();
    // await quickConnectWallet(page)
    await page.waitForFunction('document.querySelector("#token1-input").value === ""', { timeout: 5000 });
    acc2MMbal = new BigNumber(await getBalanceInMM(metamask, 'OCEAN'));
    expect(acc2MMbal.toNumber()).not.toBeCloseTo(acc1MMBal.toNumber());
    acc2DapBal = new BigNumber(await getBalanceInDapp(page, 1));
    expect(acc2DapBal.toNumber()).not.toBeCloseTo(acc1DapBal.toNumber());
  });

  it('Balance should limit input when less than max stake', async () => {
    // await selectToken(page, "SAGKRI-94", 2);
    // await selectToken(page, "OCEAN", 1);
    const input = await inputStakeAmt(page, 'max', 1);
    expect(Number(input)).toBeCloseTo(acc2MMbal.toNumber());
    expect(acc2DapBal.toNumber()).toBeCloseTo(acc2DapBal.toNumber());
  });
});
