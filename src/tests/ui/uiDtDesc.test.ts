/**
 * @jest-environment ./node_modules/@keithers98/dappeteer-stable/dist/jest/DappeteerEnvironment.js
 */
import puppeteer from 'puppeteer';
import * as dappeteer from '@keithers98/dappeteer-stable';
import 'regenerator-runtime/runtime';
import { setupDataX, closeBrowser, acceptCookies, navToTradeXFromLanding, goToLocalHost } from '../utils';
describe('Datatoken previews should work as expected', () => {
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
    await setupDataX(page, metamask, 'rinkeby', false);
    await page.bringToFront();
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });


  it('Should be able to open preview with preview dataset button', async () => {
     // open token modal
     const selectToken2 = await page.waitForSelector('#selectToken2');
     await page.waitForTimeout(150);
     await selectToken2?.click();
     // select datatoken
     const tokenModal = await page.waitForSelector('#tokenModal', { timeout: 3000 });
     expect(tokenModal).toBeDefined();
     await page.waitForTimeout(150);
     const ARCCOR20 = await page.waitForSelector('#ZEASEA-66-btn', { timeout: 3000 });
     expect(ARCCOR20).toBeDefined();
     ARCCOR20?.click();
     // check datatoken populates field
     await page.waitForTimeout(500);
     const selectedToken2 = await page.waitForSelector('#selectedToken2');
     const innerText = await selectedToken2?.getProperty('innerText');
     
     expect(await innerText?.jsonValue()).toBe('ZEASEA-66');
    // press preview dataset button
    const previewDatasetButton = await page.waitForSelector('#viewDescButton:not([disabled])');
    await page.waitForTimeout(100)
    await previewDatasetButton?.click();
    // ensure preview appears
    const datasetPreviewModal = await page.waitForSelector('#dataset-desc-vis');
    expect(datasetPreviewModal).toBeDefined();
  });
  it('Should be able to close preview with preview dataset button', async () => {
    // press preview dataset button
    const previewDatasetButton = await page.waitForSelector('#viewDescButton');
    await previewDatasetButton?.click();
    // ensure preview dissapears
    // ensure modal closes (beware it doesnt unrender, check for it in viewport
    const invisModal = await page.waitForSelector('#dataset-desc-invis');
    expect(invisModal).toBeDefined();
  });
});
