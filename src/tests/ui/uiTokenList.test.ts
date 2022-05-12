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
  navToTradeXFromLanding,
  navToStake,
  navToLp,
  importStakeInfo,
  goToLocalHost,
} from '../utils';

describe('Token modal should present datatokens and other ERC20 tokens as expected', () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;

  beforeAll(async () => {
    browser = global.browser;
    page = global.page;
    metamask = global.metamask;
    await goToLocalHost(page);
    await acceptCookies(page);
    await navToTradeXFromLanding(page);
    await setupDataX(page, metamask, 'mainnet', false);
    await page.bringToFront();
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  async function selectToken1() {
    const selectToken1 = await page.waitForSelector('#selectToken1');
    await selectToken1?.click();
    const tokenModal = await page.waitForSelector('#tokenModal', { timeout: 3000 });
    expect(tokenModal).toBeDefined();
  }

  async function selectToken2() {
    const selectToken2 = await page.waitForSelector('#selectToken2');
    await selectToken2?.click();
    const tokenModal = await page.waitForSelector('#tokenModal', { timeout: 3000 });
    expect(tokenModal).toBeDefined();
  }

  async function selectOCEAN() {
    const ERC20BTN = await page.waitForSelector('#ERC20-btn', { timeout: 3000 });
    expect(ERC20BTN).toBeDefined();
    await ERC20BTN?.click();
    const OCEAN = await page.waitForSelector('#OCEAN-btn', { timeout: 3000 });
    expect(OCEAN).toBeDefined();
    OCEAN?.click();
  }

  async function verifyToken2(token:string) {
    await page.waitForTimeout(500);
    const selectedToken2 = await page.waitForSelector('#selectedToken2');
    const innerText = await (await selectedToken2?.getProperty('innerText'))?.jsonValue();
    expect(innerText).toBe(token);
  }

  async function verifyToken1(token:string) {
    const selectedToken1 = await page.waitForSelector('#selectedToken1');
    const innerText = await (await selectedToken1?.getProperty('innerText'))?.jsonValue();
    expect(innerText).toBe(token);
  }

  async function cannotSelectERC20() {
    const ERC20BTN = await page.$('#ERC20-btn');
    expect(ERC20BTN).toBeFalsy();
  }

  async function selectDT() {
    // select datatoken
    const tokenModal = await page.waitForSelector('#tokenModal', { timeout: 3000 });
    expect(tokenModal).toBeDefined();
    const BALWHA5 = await page.waitForSelector('#BALWHA-5-btn', { timeout: 3000 });
    expect(BALWHA5).toBeDefined();
    BALWHA5?.click();
    // check datatoken populates field
    await page.waitForTimeout(500);
  }



  it('Should be able to select datatokens on trade', async () => {
    await page.waitForTimeout(1000)
    await selectToken1();
    await selectDT();
  });

  it('Should be able to select ERC20 tokens on trade', async () => {
    await selectToken2();
    await selectOCEAN();
  });

  it('Should not be able to select erc20 tokens on stake token 2', async () => {
    // click outside the token modal
    await (await page.waitForSelector('nav'))?.click();
    await page.waitForTimeout(5000);
    // nav to stake
    await navToStake(page);
    await page.waitForTimeout(5000);
    await selectToken2();
    await cannotSelectERC20();
  });

  it('Should be able to select datatokens on stake (token 2)', async () => {
    await selectDT();
    await verifyToken2('BALWHA-5')

  });

  it('Should be able to select ERC20 tokens on stake token 1', async () => {
        await page.waitForTimeout(1500);

    await selectToken1();
    await selectOCEAN();
    await verifyToken1('OCEAN')
  });

  it('Should be able to select datatokens on LP', async () => {
    // nav to lp
    await navToLp(page);
    await importStakeInfo(page, 'BALWHA-5');
    await page.waitForSelector('#BALWHA-5-lp-item', { timeout: 7000 });
  });

  it('Should not be able to select ERC20 tokens on LP', async () => {
    // OPEN TOKEN MODAL
    await page.waitForSelector('#importStakeBtn');
    await page.click('#importStakeBtn');
    await page.waitForSelector('#tokenModal');
    await cannotSelectERC20()
  });

  // it('Should fetch a new list of tokens when network changes', async () => {
  //   // nav to stake
  //   // check list for datatokens, get token 1 or length or something
  //   // check list for erc20 tokens, get token 1 or length or something
  //   // switch netowork
  //   await metamask.switchNetwork('rinkeby');
  //   // check list for datatokens, get token 1 or length or something
  //   // check list for erc20 tokens, get token 1 or length or something
  //   // ensure tokens change
  // });
});
