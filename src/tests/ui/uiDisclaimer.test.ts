/**
 * @jest-environment ./node_modules/@keithers98/dappeteer-stable/dist/jest/DappeteerEnvironment.js
 */

import puppeteer from 'puppeteer';
import * as dappeteer from '@keithers98/dappeteer-stable';
import 'regenerator-runtime/runtime';
import { closeBrowser, navToTradeXFromLanding, forceSignDisclaimer, goToLocalHost } from '../utils';

describe('Setup web3 and connect to wallet', () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;

  beforeAll(async () => {
    browser = global.browser;
    page = global.page;
    metamask = global.metamask;
    await goToLocalHost(page);
    await navToTradeXFromLanding(page);
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  it('Sign disclaimer and connect to wallet.', async () => {
    expect(page).toBeDefined();
    await page.setViewport({ width: 1039, height: 913 });
    await page.waitForSelector('#d-wallet-button');
    await page.click('#d-wallet-button');
    await page.waitForSelector('.sc-hKwDye.Klclp.web3modal-provider-container');
    await page.click('.sc-hKwDye.Klclp.web3modal-provider-container');
    // Confirm Connection in MetaMaks
    await metamask.confirmTransaction();
    await metamask.confirmTransaction();
    page.bringToFront();
    // Confirm disclaimer appears
    expect(
      await page.waitForSelector('#disclaimer-modal', {
        visible: true,
        timeout: 3000,
      })
    ).toBeDefined();
    // Sign disclaimer
    await page.waitForSelector('#sign-disclaimer-btn');
    await page.click('#sign-disclaimer-btn');

    await forceSignDisclaimer(metamask, page);
    await page.bringToFront();

    // Check wallet address in is the button
    const walletBtn = await page.waitForSelector('#d-view-txs-btn');
    await new Promise((resolve, reject) => setTimeout(resolve, 3000));
    const btnText = await page.evaluate((el) => el.textContent, walletBtn);
    expect(btnText).toBe('0x867...DfAd');
  });

  // test wallet doest ask for signature if in local storage in next session
});

// Test priority

// High value features

// Boilerplate
// 1.Connecting to provider
// 2.Accessing user wallet
// 3.Collecting wallet information
// 4.Getting token lists

// Making Trade:
// 1. OCEAN to DT
// 2. DT to OCEAN
// 3. DT to DT

// Staking:
// 1. Stake ocean in Pool

// Unstaking:
// 1. Unstake ocean from pool

// LP:
// 1. Pool Import
// 2. Pool Scan

// Edge cases in highvalue features:
//
