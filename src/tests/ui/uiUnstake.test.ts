/**
 * @jest-environment ./node_modules/@keithers98/dappeteer-stable/dist/jest/DappeteerEnvironment.js
 */
import puppeteer from 'puppeteer';
import * as dappeteer from '@keithers98/dappeteer-stable';
import 'regenerator-runtime/runtime';
import {
  setupDataX,
  closeBrowser,
  quickConnectWallet,
  getBalanceInMM,
  navToTradeXFromLanding,
  acceptCookies,
  navToRemoveStake,
  getExecuteButtonText,
  inputUnstakeAmt,
  getSharesFromUnstake,
  switchAccounts,
  useXPath,
  selectRemoveStakeButton,
  selectOrImportPool,
  selectToken,
  goToLocalHost,
} from '../utils';

describe('User Interface Works as Expected', () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;

  beforeAll(async () => {
    browser = global.browser;
    page = global.page;
    metamask = global.metamask;
    await goToLocalHost(page);
    await page.setViewport({ width: 1039, height: 913 });
    await navToTradeXFromLanding(page);
    await acceptCookies(page);
    await setupDataX(page, metamask, 'rinkeby', false);
    await navToRemoveStake(page, 'SAGKRI-94');
    await page.bringToFront();
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  it('Should have OCEAN balance > 0 to run these tests', async () => {
    const balance = await getBalanceInMM(metamask, 'OCEAN');
    expect(Number(balance)).toBeGreaterThan(0);
  });

  it('Unstake button is disabled when input = 0', async () => {
    await page.bringToFront();
    const btnText = await getExecuteButtonText(page, 'unstake', 'Select');
    expect(btnText).toBe('Select a Token');
    expect(await page.waitForSelector('#executeUnstake[disabled]', { timeout: 1500 })).toBeTruthy();
  });

  it('Unstake button is disabled when input = 0', async () => {
    await selectToken(page, 'OCEAN', 1);
    const btnText = await getExecuteButtonText(page, 'unstake', 'Enter');
    expect(btnText).toBe('Enter Amount to Remove');
    expect(await page.waitForSelector('#executeUnstake[disabled]', { timeout: 1500 })).toBeTruthy();
  });

  it('Unstake button is enabled when input is > 0', async () => {
    const shares = await getSharesFromUnstake(page);
    await page.waitForTimeout(2500);
    const { input, receive } = await inputUnstakeAmt(page, '1', shares || '');
    expect(Number(input)).toBeGreaterThan(0);
    expect(Number(receive)).toBeGreaterThan(0);
    await page.waitForFunction("document.querySelector('#executeUnstake[disabled]') === null", { timeout: 1500 });
    const btnText = await getExecuteButtonText(page, 'unstake', 'Withdrawal');
    expect(btnText).toBe('Withdrawal');
  });

  // it("Stake button is disabled when input > balance", async () => {});
  it('Transactions for less than .01 ocean are not allowed', async () => {
    await page.reload();
    await quickConnectWallet(page);
    await selectToken(page, 'OCEAN', 1);
    await page.waitForSelector('#removeStakeModal');
    const shares = await getSharesFromUnstake(page);
    const { input, receive } = await inputUnstakeAmt(page, '.0001', shares || '');
    expect(Number(input)).toEqual(0.0001);
    expect(Number(receive)).toBeLessThan(0.01);
    const btnText = await getExecuteButtonText(page, 'unstake', 'Minimum');
    expect(btnText).toBe('Minimum Removal is .01 OCEAN');
  });

  // it("Max button disabled before token is selected", async () => {});

  it('Max unstake should limit input when less than user shares', async () => {
    const shares = await getSharesFromUnstake(page);
    const { input, receive } = await inputUnstakeAmt(page, 'max', shares || '');
    expect(Number(input)).toBeLessThan(100);
    expect(Number(receive)).toBeGreaterThan(0);
    const btnText = await getExecuteButtonText(page, 'unstake', 'Unlock');
    expect(btnText).toBe('Unlock OCEAN');
  });

  it('Navigates to lp when account changes', async () => {
    await switchAccounts(metamask, page, 2, true);
    await page.bringToFront();
    await page.waitForSelector('#lpModal');
  });

  it('Shows connect wallet modal when there is no wallet connected', async () => {
    await selectOrImportPool(page, 'SAGKRI-94', true);
    await selectRemoveStakeButton(page);
    await page.reload();
    const element = await useXPath(page, 'p', 'Connect your wallet to continue.', false);
    expect(element).toBeTruthy();
  });

  it('Shares updates when connecting wallet', async () => {
    await quickConnectWallet(page);
    await page.waitForSelector('#sharesDisplay');
    await page.waitForFunction('document.querySelector("#sharesDisplay").innerText !== ""');
    const shares = await getSharesFromUnstake(page);
    expect(Number(shares)).toBeGreaterThan(0);
  });

  it('Shares should limit input when less than max stake', async () => {
    await selectToken(page, 'OCEAN', 1);
    const shares = await getSharesFromUnstake(page);
    if (Number(shares) === 0) {
      expect(await page.waitForSelector('#maxBtn[disabled]', { timeout: 1500 })).toBeTruthy();
    } else {
      const shares = await getSharesFromUnstake(page);
      await page.waitForTimeout(2500);
      const { input, receive } = await inputUnstakeAmt(page, 'max', shares || '');
      expect(Number(input)).toBe(100);
      expect(Number(receive)).toBeGreaterThan(0);
      const btnText = await getExecuteButtonText(page, 'unstake', 'Unlock');
      expect(btnText).toBe('Unlock OCEAN');
    }
  });
});
