import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { setupDappBrowser, setupDataX, closeBrowser } from "../Setup";
import {
  approveTransactions,
  confirmAndCloseTxDoneModal,
  confirmTokensClearedAfterTrade,
  reloadOrContinue,
  setUpSwap,
} from "../Utilities";

describe("Execute Standard Trades on TradeX", () => {
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
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });
  it("10 OCEAN -> SAGKRI-94", async () => {
    try {
      await setUpSwap(page, "OCEAN", "SAGKRI-94", "10");
      await approveTransactions(metamask, page, 2);
      await confirmAndCloseTxDoneModal(page);
      await confirmTokensClearedAfterTrade(page);
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  it(".1 OCEAN -> SAGKRI-94", async () => {
    try {
      await reloadOrContinue(lastTestPassed, page);
      await setUpSwap(page, "OCEAN", "SAGKRI-94", ".1");
      await approveTransactions(metamask, page, 2);
      await confirmAndCloseTxDoneModal(page);
      await confirmTokensClearedAfterTrade(page);
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  it("MAX OCEAN -> SAGKRI-94", async () => {
    try {
      await reloadOrContinue(lastTestPassed, page);
      await setUpSwap(page, "OCEAN", "SAGKRI-94", "max");
      await approveTransactions(metamask, page, 2);
      await confirmAndCloseTxDoneModal(page);
      await confirmTokensClearedAfterTrade(page);
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  it("1 SAGKRI-94 -> OCEAN", async () => {
    try {
      await reloadOrContinue(lastTestPassed, page);
      await setUpSwap(page, "SAGKRI-94", "OCEAN", "1");
      await approveTransactions(metamask, page, 2);
      await confirmAndCloseTxDoneModal(page);
      await confirmTokensClearedAfterTrade(page);
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  it("1 SAGKRI-94 -> DAZORC-13", async () => {
    try {
      await reloadOrContinue(lastTestPassed, page);
      await setUpSwap(page, "SAGKRI-94", "DAZORC-13", "1");
      await approveTransactions(metamask, page, 2);
      await confirmAndCloseTxDoneModal(page);
      await confirmTokensClearedAfterTrade(page);
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  it("MAX DAZORC-13 -> SAGKRI-94", async () => {
    try {
      await reloadOrContinue(lastTestPassed, page);
      await setUpSwap(page, "DAZORC-13", "SAGKRI-94", "max");
      await approveTransactions(metamask, page, 2);
      await confirmAndCloseTxDoneModal(page);
      await confirmTokensClearedAfterTrade(page);
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  async function maxUnstakeSAGKRI() {
    await setUpSwap(page, "SAGKRI-94", "OCEAN", "max");
    await approveTransactions(metamask, page, 2);
    await confirmAndCloseTxDoneModal(page);
    await confirmTokensClearedAfterTrade(page);
  }

  it("MAX SAGKRI-94 -> OCEAN", async () => {
    try {
      await reloadOrContinue(lastTestPassed, page);
      await maxUnstakeSAGKRI();
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  it("Trade All but .1 DT to OCEAN", async () => {
    try {
      reloadOrContinue(lastTestPassed, page);
      await setUpSwap(page, "SAGKRI-94", "OCEAN", "max");
      let set = true;
      await page.waitForSelector("#token1-balance");
      while (await page.evaluate('Number(document.querySelector("#token1-balance").innerText) > 0.1')) {
        if (set === true) {
          await approveTransactions(metamask, page, 2);
          await confirmAndCloseTxDoneModal(page);
          await confirmTokensClearedAfterTrade(page);
          set = false;
        } else {
          await maxUnstakeSAGKRI();
        }
      }
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });
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
