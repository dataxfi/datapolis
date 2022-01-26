import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { setupDappBrowser, setupDataX, closeBrowser } from "../../Setup";
import {
  approveTransactions,
  checkBalance,
  confirmAndCloseTxDoneModal,
  confirmSwapModal,
  confirmTokensClearedAfterTrade,
  executeTransaction,
  reloadOrContinue,
  setUpSwap,
} from "../../Utilities";

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
    await setupDataX(page, metamask, "rinkeby", false);
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  it("Should unlock tokens permenantly", ()=>{})
  it("Same token pair should be unlocked in StakeX", ()=>{})
  it("Should unlock tokens once", ()=>{})
  it("Same token pair should be unlocked in unstake", ()=>{})

});

