import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { setupDappBrowser, setupDataX, closeBrowser, quickConnectWallet, testAcctId } from "../Setup";
import {
  approveTransactions,
  confirmAndCloseTxDoneModal,
  confirmInputClearedAfterStake,
  confirmInputClearedAfterUnstake,
  importStakeInfo,
  navToLp,
  navToRemoveStake,
  reloadOrContinue,
  setupRemoveStake,
  setUpStake,
  useLocalStorage,
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
    await navToRemoveStake(page, "SAGKRI-94");
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  //with new .001 min ocean tx feature, design this test to pass if .001 validation stops the transaction
  it("Unstake 1% from SAGKRI-94", async () => {
    try {
      await setupRemoveStake(page, "1");
      await approveTransactions(metamask, page, 2);
      await confirmAndCloseTxDoneModal(page);
      await confirmInputClearedAfterUnstake(page);
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  it("Unstake 50% from SAGKRI-94", async () => {
    try {
      await reloadOrContinue(lastTestPassed, page)
      await setupRemoveStake(page, "50");
      await approveTransactions(metamask, page, 2);
      await confirmAndCloseTxDoneModal(page);
      await confirmInputClearedAfterUnstake(page);
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  it("Unstake max from SAGKRI-94", async () => {
    try {
      await reloadOrContinue(lastTestPassed, page)
      await setupRemoveStake(page, "max");
      await approveTransactions(metamask, page, 2);
      await confirmAndCloseTxDoneModal(page);
      await confirmInputClearedAfterUnstake(page);
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });
});
