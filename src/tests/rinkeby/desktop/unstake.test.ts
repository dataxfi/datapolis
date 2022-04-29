import puppeteer from "puppeteer";
import * as dappeteer from "@keithers98/dappeteer-stable";
import "regenerator-runtime/runtime";
import {
  setupDappBrowser,
  setupDataX,
  closeBrowser,
  approveTransactions,
  confirmAndCloseTxDoneModal,
  confirmInputClearedAfterUnstake,
  navToRemoveStake,
  reloadOrContinue,
  setupUnstake,
  executeTransaction,
  awaitUpdateShares,
  navToTradeXFromLanding,
  acceptCookies,
} from "../../utils";
import BigNumber from "bignumber.js";
describe("Execute Standard Trades on Stake", () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;
  let lastTestPassed: boolean = true;
  let initialShares: BigNumber;

  beforeAll(async () => {
    const tools = await setupDappBrowser();
    if (tools) {
      page = tools?.page;
      browser = tools?.browser;
      metamask = tools?.metamask;
    }
    await page.setViewport({ width: 1039, height: 913 });
    await acceptCookies(page)
    await navToTradeXFromLanding(page)
    await setupDataX(page, metamask, "rinkeby", false);
    initialShares = await navToRemoveStake(page, "SAGKRI-94");
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  async function stdUnstakeFlow(amt: string) {
    try {
      await page.waitForTimeout(250);
      await setupUnstake(page, amt, initialShares);
      await executeTransaction(page, metamask, "unstake");
      await approveTransactions(metamask, page, 1);
      await confirmAndCloseTxDoneModal(page);
      initialShares = new BigNumber(await awaitUpdateShares(page, initialShares));
      await confirmInputClearedAfterUnstake(page);
      lastTestPassed = true;
    } catch (error) {
      lastTestPassed = false;
      throw error;
    }
  }

  //with new .001 min ocean tx feature, design this test to pass if .001 validation stops the transaction
  it("Unstake 1% from SAGKRI-94", async () => {
    await stdUnstakeFlow("1");
  });

  it("Unstake 50% from SAGKRI-94", async () => {
    await reloadOrContinue(lastTestPassed, page);
    await stdUnstakeFlow("50");
  });

  it("Unstake max from SAGKRI-94", async () => {
    await reloadOrContinue(lastTestPassed, page);
    await stdUnstakeFlow("max");
  });
});
