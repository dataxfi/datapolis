/**
 * @jest-environment ./node_modules/@keithers98/dappeteer-stable/dist/jest/DappeteerEnvironment.js
 */
import puppeteer from 'puppeteer';
import * as dappeteer from '@keithers98/dappeteer-stable';
import 'regenerator-runtime/runtime';
import {
  setupDataX,
  closeBrowser,
  getBalanceInMM,
  acceptCookies,
  switchAccounts,
  evaluateMax,
  getBalanceInDapp,
  swapOrSelect,
  clickMaxTrade,
  selectToken,
  awaitTokenSelect,
  getPercInDapp,
  typeAmount,
  getExecuteButtonText,
  getSelectedTokens,
  navToTradeXFromLanding,
  goToLocalHost,
} from '../utils';
import BigNumber from 'bignumber.js';
describe('Trade Platform User Interface Works as Expected', () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;
  let acc1DapBalT1: BigNumber,
    acc1MMBalT1: BigNumber,
    acc2DapBalT1: BigNumber,
    acc2MMBalT1: BigNumber,
    acc1DapBalT2: BigNumber,
    acc1MMBalT2: BigNumber,
    acc2DapBalT2: BigNumber,
    acc2MMBalT2: BigNumber;

  beforeAll(async () => {
    browser = global.browser;
    page = global.page;
    metamask = global.metamask;
    await goToLocalHost(page);
    await acceptCookies(page);
    await navToTradeXFromLanding(page);
    await setupDataX(page, metamask, 'rinkeby', false);
    await page.bringToFront();
    acc1MMBalT1 = new BigNumber(await getBalanceInMM(metamask, 'OCEAN'));
    acc1MMBalT2 = new BigNumber(await getBalanceInMM(metamask, 'SAGKRI-94'));
    await page.bringToFront();
    await swapOrSelect(page, 'OCEAN', 'SAGKRI-94');
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  it('Should have OCEAN balance > 0 to run these tests', async () => {
    expect(acc1MMBalT1.toNumber()).toBeGreaterThan(0);
  });

  // Trade

  it('Balance is same in dapp and MM', async () => {
    await page.waitForTimeout(2500);
    acc1DapBalT1 = new BigNumber(await getBalanceInDapp(page, 1));
    acc1DapBalT2 = new BigNumber(await getBalanceInDapp(page, 2));

    expect(acc1DapBalT1.toNumber()).toBeCloseTo(acc1MMBalT1.toNumber());
    expect(acc1DapBalT2.toNumber()).toBeCloseTo(acc1MMBalT2.toNumber());
  });

  it('Max exchange should limit input when less than balance', async () => {
    await clickMaxTrade(page);
    const { limit, t1Max, t2Max, t1Input, t2Input } = await evaluateMax(page, acc1DapBalT1);
    expect(limit).toBe('max');
    expect(t1Max.toNumber()).toBeLessThan(acc1DapBalT1.toNumber());
    expect(t1Input.toNumber()).toBeCloseTo(t1Max.toNumber());
    expect(t2Input.toNumber()).toBeCloseTo(t2Max.toNumber());
  });

  it('Should clear token modal and show disclaimer when switching to an unsigned account', async () => {
    await switchAccounts(metamask, page, 2, true);
    await page.waitForTimeout(2500);
    expect(await page.waitForSelector('#selectToken1')).toBeDefined();
    expect(await page.waitForSelector('#selectToken2')).toBeDefined();
  });

  it('Balance should update when switching accounts', async () => {
    await switchAccounts(metamask, page, 1, false);
    await page.waitForTimeout(2500);
    await swapOrSelect(page, 'OCEAN', 'SAGKRI-94');
    await switchAccounts(metamask, page, 2, false);
    await page.waitForTimeout(2500);
    acc2DapBalT1 = new BigNumber(await getBalanceInDapp(page, 1));
    acc2MMBalT1 = new BigNumber(await getBalanceInMM(metamask, 'OCEAN'));
    acc2DapBalT2 = new BigNumber(await getBalanceInDapp(page, 2));
    acc2MMBalT2 = new BigNumber(await getBalanceInMM(metamask, 'SAGKRI-94'));
    expect(acc2DapBalT1.toNumber()).toBeCloseTo(acc2MMBalT1.toNumber());
    expect(acc2DapBalT2.toNumber()).toBeCloseTo(acc2MMBalT2.toNumber());
  });

  it('Balance should limit input when less than max exchange', async () => {
    await clickMaxTrade(page);
    const { limit, t1Max, t2Max, t1Input, t2Input } = await evaluateMax(page, acc2DapBalT1);
    expect(limit).toBe('bal');
    expect(t1Input.toNumber()).toBeCloseTo(acc2DapBalT1.toNumber());
    expect(t1Input.toNumber()).toEqual(t1Max.toNumber());
    expect(t2Input.toNumber()).toEqual(t2Max.toNumber());
  });

  it('Inputs and perc are all reset to 0 when token 1 or 2 changes', async () => {
    await selectToken(page, 'DAZORC-13', 1);
    await awaitTokenSelect(page, 'DAZORC-13', 1);
    await page.waitForTimeout(2500);
    const { t1Input, t2Input } = await evaluateMax(page, acc2DapBalT1);
    expect(t1Input.toString()).toBe('0');
    expect(t2Input.toString()).toBe('0');
    const perc = await getPercInDapp(page);
    expect(perc.toString()).toBe('0');
  });

  it('If balance is 0 max btn and perc input are disabled, ', async () => {
    await selectToken(page, 'ZEASEA-66', 1);
    await awaitTokenSelect(page, 'ZEASEA-66', 1);
    expect(await page.waitForSelector('#maxBtn[disabled]')).toBeDefined();
    expect(await page.waitForSelector('#token1-perc-input[disabled]')).toBeDefined();
  });

  it('If balance is 0 the execute transaction button says not enough token', async () => {
    await typeAmount(page, '10', 1, 'ZEASEA-66', 'SAGKRI-94');
    const btnText = await getExecuteButtonText(page, 'trade', 'Not Enough ZEASEA-66');
    const { t1Input, t2Input } = await evaluateMax(page, acc2DapBalT1);
    expect(t1Input.toString()).toBe('10');
    expect(t2Input.toNumber()).toBeGreaterThan(0);
    expect(btnText).toBe('Not Enough ZEASEA-66');
  });

  it('Transactions for less than .01 ocean are not allowed', async () => {
    await selectToken(page, 'OCEAN', 1);
    await typeAmount(page, '.009', 1, 'OCEAN', 'SAGKRI-94', false);
    await page.waitForSelector('#executeTradeBtn[disabled]');
    await page.waitForFunction('document.querySelector("#executeTradeBtn").innerText.includes("Minimum")');
    const text = await getExecuteButtonText(page, 'trade');
    expect(text).toContain('Minimum trade is');
  });

  it('Swap button should swap tokens and their information', async () => {
    await swapOrSelect(page, 'SAGKRI-94', 'OCEAN');
    // @ts-ignore
    const { currentT1, currentT2 } = await getSelectedTokens(page, 3);
    expect(currentT1).toBe('SAGKRI-94');
    expect(currentT2).toBe('OCEAN');
    const newT1Bal = await getBalanceInDapp(page, 1);
    const newT2Bal = await getBalanceInDapp(page, 2);

    expect(newT1Bal).toBeCloseTo(acc2DapBalT2.toNumber());
    expect(newT2Bal).toBeCloseTo(acc2DapBalT1.toNumber());

    acc2DapBalT2 = new BigNumber(newT2Bal);
    acc2DapBalT1 = new BigNumber(newT1Bal);
  });

  // it("Swap rate in tradex and Stake are the same", async () => {});
  // it("Trade button is: disabled when input = 0, enabled when input is > 0, disabled when input > balance", () => {});
  // it("Trade button says select token when before token is selected", async () => {});
  // it("Trade button says enter ocean amount when token is selected", async () => {});
  // it("Trade button says unlock or stake when token input is entered", async () => {});
});
