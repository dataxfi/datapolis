import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { setupDappBrowser, setupDataX, closeBrowser } from "../Setup";
import {
  approveTransaction,
  approveTransactions,
  checkBalance,
  confirmAndCloseTxDoneModal,
  confirmTokensClearedAfterTrade,
  executeTransaction,
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
    // await closeBrowser(browser);
  });
  it("10 OCEAN -> SAGKRI-94", async () => {
    try {
      await setUpSwap(page, metamask, "OCEAN", "SAGKRI-94", "10", 1);
      await checkBalance(page, metamask, false, "SAGKRI-94");
      const confirmations = await executeTransaction(page, "trade");
      confirmations > 1 ? await approveTransactions(metamask, page, confirmations) : await approveTransaction(metamask);
      await confirmAndCloseTxDoneModal(page);
      await confirmTokensClearedAfterTrade(page);
      await setUpSwap(page, metamask, "OCEAN", "SAGKRI-94", "0", 1);
      await checkBalance(page, metamask, true, "SAGKRI-94");
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  it(".1 OCEAN -> SAGKRI-94", async () => {
    try {
      await reloadOrContinue(lastTestPassed, page);
      await setUpSwap(page, metamask, "OCEAN", "SAGKRI-94", ".1", 1);
      await checkBalance(page, metamask, false, "SAGKRI-94");
      const confirmations = await executeTransaction(page, "trade");
      confirmations > 1 ? await approveTransactions(metamask, page, confirmations) : await approveTransaction(metamask);
      await confirmAndCloseTxDoneModal(page);
      await confirmTokensClearedAfterTrade(page);
      await setUpSwap(page, metamask, "OCEAN", "SAGKRI-94", "0", 1);
      await checkBalance(page, metamask, true, "SAGKRI-94");
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  it("MAX OCEAN -> SAGKRI-94", async () => {
    try {
      await reloadOrContinue(lastTestPassed, page);
      await setUpSwap(page, metamask, "OCEAN", "SAGKRI-94", "max", 1);
      await checkBalance(page, metamask, false, "SAGKRI-94");
     const confirmations =  await executeTransaction(page, "trade");
      confirmations > 1 ? await approveTransactions(metamask, page, confirmations) : await approveTransaction(metamask);
      await confirmAndCloseTxDoneModal(page);
      await confirmTokensClearedAfterTrade(page);
      await setUpSwap(page, metamask, "OCEAN", "SAGKRI-94", "0", 1);
      await checkBalance(page, metamask, true, "SAGKRI-94");
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  it("1 SAGKRI-94 -> OCEAN", async () => {
    try {
      await reloadOrContinue(false, page);
      await setUpSwap(page, metamask, "SAGKRI-94", "OCEAN", "1", 1);
      await checkBalance(page, metamask, false, "OCEAN", "SAGKRI-94");
      const confirmations =  await executeTransaction(page, "trade");
      confirmations > 1 ? await approveTransactions(metamask, page, confirmations) : await approveTransaction(metamask);
      await reloadOrContinue(lastTestPassed, page);
      await confirmAndCloseTxDoneModal(page);
      await confirmTokensClearedAfterTrade(page);
      await setUpSwap(page, metamask, "SAGKRI-94","OCEAN" , "0", 1);
      await checkBalance(page, metamask, true, "OCEAN", "SAGKRI-94");
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  it("1 SAGKRI-94 -> DAZORC-13", async () => {
    try {
      await reloadOrContinue(lastTestPassed, page);
      await setUpSwap(page, metamask, "SAGKRI-94", "DAZORC-13", "1", 1);
      await checkBalance(page, metamask, false, "DAZORC-13", "SAGKRI-94");
      const confirmations = await executeTransaction(page, "trade");
      confirmations > 1 ? await approveTransactions(metamask, page, confirmations) : await approveTransaction(metamask);
      await confirmAndCloseTxDoneModal(page);
      await confirmTokensClearedAfterTrade(page);
      await setUpSwap(page, metamask, "OCEAN", "SAGKRI-94", "0", 1);
      await checkBalance(page, metamask, true, "DAZORC-13", "SAGKRI-94");
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  it("MAX DAZORC-13 -> SAGKRI-94", async () => {
    try {
      await reloadOrContinue(lastTestPassed, page);
      await setUpSwap(page, metamask, "DAZORC-13", "SAGKRI-94", "max", 1);
      await checkBalance(page, metamask, false, "SAGKRI-94", "DAZORC-13");
      const confirmations = await executeTransaction(page, "trade");
      confirmations > 1 ? await approveTransactions(metamask, page, confirmations) : await approveTransaction(metamask);
      await confirmAndCloseTxDoneModal(page);
      await confirmTokensClearedAfterTrade(page);
      await setUpSwap(page, metamask,  "DAZORC-13", "SAGKRI-94", "0", 1);
      await checkBalance(page, metamask, true, "SAGKRI-94", "DAZORC-13");
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  async function maxTradeSAGKRI() {
    await setUpSwap(page, metamask, "SAGKRI-94", "OCEAN", "max", 1);
    await checkBalance(page, metamask, false, "OCEAN","SAGKRI-94");
    const confirmations = await executeTransaction(page, "trade");
    confirmations > 1 ? await approveTransactions(metamask, page, confirmations) : await approveTransaction(metamask);
    await confirmAndCloseTxDoneModal(page);
    await confirmTokensClearedAfterTrade(page);
    await setUpSwap(page, metamask, "SAGKRI-94", "OCEAN", "0", 1);
    await checkBalance(page, metamask, true, "OCEAN","SAGKRI-94");
  }

  it("MAX SAGKRI-94 -> OCEAN", async () => {
    try {
      await reloadOrContinue(lastTestPassed, page);
      await maxTradeSAGKRI();
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  });

  // it("Trade All but .1 DT to OCEAN", async () => {
  //   try {
  //     reloadOrContinue(lastTestPassed, page);
  //     await setUpSwap(page, "SAGKRI-94", "OCEAN", "max");
  //     let set = true;
  //     await page.waitForSelector("#token1-balance");
  //     while (await page.evaluate('Number(document.querySelector("#token1-balance").innerText) > 0.1')) {
  //       if (set === true) {
  //         await approveTransactions(metamask, page, 2);
  //         await confirmAndCloseTxDoneModal(page);
  //         await confirmTokensClearedAfterTrade(page);
  //         set = false;
  //       } else {
  //         await maxUnstakeSAGKRI();
  //       }
  //     }
  //     lastTestPassed = true;
  //   } catch (error) {
  //     lastTestPassed = false;
  //     throw error;
  //   }
  // });
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
