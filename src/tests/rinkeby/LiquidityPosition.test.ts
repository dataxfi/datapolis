import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { setupDappBrowser, setupDataX, closeBrowser, quickConnectWallet, testAcctId } from "../Setup";
import {
  approveTransactions,
  confirmAndCloseTxDoneModal,
  confirmInputClearedAfterStake,
  navToLp,
  reloadOrContinue,
  setUpStake,
} from "../Utilities";

describe("Execute Standard Trades on StakeX", () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;
  let lastTestPassed: boolean = true;

  beforeAll(async () => {
    const tools = await setupDappBrowser();
    if (tools) {
      page = tools?.page;
      browser = tools?.browser;
      metamask = tools?.metamask;
    }
    await setupDataX(page, browser, metamask);
    // await page.evaluate(() => {window.localStorage.removeItem(`allStakedPools@4@${testAcctId}`)});
    await navToLp(page);
  });

  //No duplicates test is needed

  afterAll(async () => {
    await closeBrowser(browser);
  });

  it("Import message should show when no staked pools.", async () => {
    await page.waitForSelector("#importMessage");
  });

  it("Should not show loading if no staked pools.", async () => {
    await page.waitForFunction('document.querySelector("#loadingStakeMessage") === null', { timeout: 5000 });
  });

  it("Shoud disable buttons if wallet isn't connected.", async () => {
    await page.reload();
    await page.waitForSelector("#d-wallet-button");
    await page.waitForFunction('document.querySelector("#d-view-txs-btn") === null');
    await page.waitForSelector("#importStakeBtn[disabled]");
    await page.waitForSelector("#scanStakeBtn[disabled]");
  });

  it("Shoud enable buttons if wallet is connected.", async () => {
    await quickConnectWallet(page);
    await page.waitForSelector("#d-view-txs-btn");
    await page.waitForFunction('document.querySelector("#d-wallet-button") === null');
    await page.waitForSelector("#importStakeBtn:not([disabled])");
    await page.waitForSelector("#scanStakeBtn:not([disabled])");
  });
});
