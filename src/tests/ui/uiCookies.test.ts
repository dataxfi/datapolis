/**
 * @jest-environment ./node_modules/@keithers98/dappeteer-stable/dist/jest/DappeteerEnvironment.js
 */

import puppeteer from 'puppeteer';
import 'regenerator-runtime/runtime';
import { acceptCookies, closeBrowser, goToLocalHost } from '../utils';

describe('Execute Standard Trades on Stake', () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;

  beforeAll(async () => {
    browser = global.browser;
    page = global.page;
    console.log(!!browser, !!page)
    await goToLocalHost(page);
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  async function checkCookies(value: string) {
    const cookies = await page.evaluate(() => window.localStorage.getItem('cookiesAllowed'));
    expect(cookies).toBe(value);
  }
  async function checkCookiesDoesntAppear(value: string) {
    await page.reload();
    await page.waitForTimeout(500);
    await checkCookies(value);
    await page.waitForFunction('document.querySelector("#cookiesModal") === null');
  }

  it('Cookie modal should be present on load.', async () => {
    await page.waitForSelector('#cookiesModal');
    await checkCookies('null');
  });

  it('Cookie modal should dissapear when cookies are accepted.', async () => {
    await acceptCookies(page);
    await checkCookies('true');
    await page.waitForFunction('document.querySelector("#cookiesModal") === null');
  });

  it('Cookie modal shouldnt reappear when set to true and page reloads.', async () => {
    await checkCookiesDoesntAppear('true');
  });

  it('Cookie modal should dissapear when cookies are denied.', async () => {
    await page.evaluate(() => window.localStorage.removeItem('cookiesAllowed'));
    await page.reload();
    await page.waitForSelector('#cookiesModal');
    await page.waitForSelector('#denyCookies');
    await page.click('#denyCookies');
    await page.waitForTimeout(500);
    await checkCookies('false');
    await page.waitForFunction('document.querySelector("#cookiesModal") === null');
  });

  it('Cookie modal shouldnt reappear when set to false and page reloads.', async () => {
    await checkCookiesDoesntAppear('false');
  });
});
