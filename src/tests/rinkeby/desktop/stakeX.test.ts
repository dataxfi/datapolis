import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { setupDappBrowser, setupDataX, closeBrowser } from "../../Setup";
import {
  approveTransactions,
  confirmAndCloseTxDoneModal,
  confirmInputClearedAfterStake,
  executeTransaction,
  navToStake,
  reloadOrContinue,
  setUpStake,
} from "../../Utilities";

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
    await setupDataX(page, metamask, "rinkeby", false);
    await navToStake(page);
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  it("Stake 10 OCEAN in SAGKRI-94", async () => {
    try {
      await setUpStake(page, "SAGKRI-94", "10");
      await executeTransaction(page, metamask, "stake");
      await approveTransactions(metamask, page, 1);
      await confirmAndCloseTxDoneModal(page);
      await confirmInputClearedAfterStake(page);
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  it("Stake .1 OCEAN in SAGKRI-94", async () => {
    try {
      await reloadOrContinue(lastTestPassed, page, true);
      await setUpStake(page, "SAGKRI-94", ".1");
      await executeTransaction(page, metamask, "stake");
      await approveTransactions(metamask, page, 1);
      await confirmAndCloseTxDoneModal(page);
      await confirmInputClearedAfterStake(page);
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  it("Stake max OCEAN in SAGKRI-94", async () => {
    try {
      await reloadOrContinue(lastTestPassed, page, true);
      await setUpStake(page, "SAGKRI-94", "max");
      await executeTransaction(page, metamask, "stake");
      await approveTransactions(metamask, page, 1);
      await confirmAndCloseTxDoneModal(page);
      await confirmInputClearedAfterStake(page);
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });
});
