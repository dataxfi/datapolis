/**
 * @jest-environment ./node_modules/@keithers98/dappeteer-stable/dist/jest/DappeteerEnvironment.js
 */

import puppeteer from 'puppeteer';
import * as dappeteer from '@keithers98/dappeteer-stable';
import 'regenerator-runtime/runtime';
import LocalSetup from '../localSetup';

describe('Dapp functions without errors', () => {
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;

  beforeAll(async () => {
    const localSetup = new LocalSetup();
    await localSetup.setupLocalSetup()
    console.log(localSetup);
    browser = global.browser;
    metamask = global.metamask;
    page = global.page;
  });

  afterAll(()=>{
      browser.close()
  })

  it('passes', () => {
    expect(true).toBeTruthy();
  });
});
