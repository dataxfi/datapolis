/**
 * @jest-environment ./node_modules/@keithers98/dappeteer-stable/dist/jest/DappeteerEnvironment.js
 */

import puppeteer from 'puppeteer';
import * as dappeteer from '@keithers98/dappeteer-stable';
import 'regenerator-runtime/runtime';
import LocalSetup from '../ganacheSetup';

describe('Dapp functions without errors', () => {
  jest.setTimeout(60 * 5 * 1000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;

  beforeAll(async () => {
    const localSetup = new LocalSetup();
    await localSetup.setupLocalSetup();
    browser = global.browser;
    metamask = global.metamask;
    page = global.page;

    await metamask.switchNetwork('Localhost 8545');

    // Workaround function for addToken() bug which leaves you in the token import screen
    async function goBackToMain() {
      await metamask.page.waitForSelector('.fas.fa-chevron-left.asset-breadcrumb__chevron');
    }

    async function importPkAndTokens(index: number) {
      await metamask.importPK(localSetup.privateKeys[index]);
      await metamask.addToken(localSetup.sagkri);
      await goBackToMain();
      await metamask.addToken(localSetup.oceanTokenAddress);
      await goBackToMain();
    }

    await importPkAndTokens(0);
    await importPkAndTokens(1);
    await importPkAndTokens(2);

    //TODO: store this config object in local storage for the dapp to use this as config state when connecting wallet
    const config = {
      factoryAddress: localSetup.DTFactory,
      poolFactoryAddress: localSetup.BFactory,
      oceanTokenAddress: localSetup.oceanTokenAddress,
      startBlock: 0,
      chainId: 1337,
      //Router Address
      //Token list address
    };
  });

  afterAll(() => {
    browser.close();
  });

  it('passes', () => {
    expect(true).toBeTruthy();
  });
});
