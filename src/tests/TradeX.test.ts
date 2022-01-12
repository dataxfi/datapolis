import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { setupBrowser, setupDataX, closeBrowser } from "./Setup";
import { approveTransactions, confirmAndCloseTxDoneModal, setUpSwap } from "./Utilities";

describe("Setup web3 and connect to wallet", () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;

  beforeAll(async () => {
    const tools = await setupBrowser();
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
    await setUpSwap(page, "OCEAN", "SAGKRI-94", "10");
    await approveTransactions(metamask, page, 2);
    await confirmAndCloseTxDoneModal(page);
  });

  it(".1 OCEAN -> SAGKRI-94", async () => {
    await setUpSwap(page, "OCEAN", "SAGKRI-94", ".1");
    await approveTransactions(metamask, page, 2);
    await confirmAndCloseTxDoneModal(page);
  });

  it("MAX SAGKRI-94 -> OCEAN", async () => {
    await setUpSwap(page, "SAGKRI-94", "OCEAN", "max");
    await approveTransactions(metamask, page, 2);
    await confirmAndCloseTxDoneModal(page);
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
