import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import {
  setupDappBrowser,
  setupDataX,
  closeBrowser,
  quickConnectWallet,
  getBalanceInMM,
  navToTradeXFromLanding,
  acceptCookies,
  navToRemoveStake,
  getExecuteButtonText,
  inputUnstakeAmt,
  getSharesFromUnstake,
  clearInput,
  switchAccounts,
  useXPath,
} from "../utils";
import BigNumber from "bignumber.js";
describe("User Interface Works as Expected", () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;
  let initialShares: BigNumber;

  beforeAll(async () => {
    const tools = await setupDappBrowser(true);
    if (tools) {
      page = tools?.page;
      browser = tools?.browser;
      metamask = tools?.metamask;
    }
    await page.setViewport({ width: 1039, height: 913 });
    await navToTradeXFromLanding(page);
    initialShares = await navToRemoveStake(page, "SAGKRI-94");
    await setupDataX(page, metamask, "rinkeby", false);
    await page.bringToFront();
    await acceptCookies(page);
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  it("Should have OCEAN balance > 0 to run these tests", async () => {
    const balance = await getBalanceInMM(metamask, "OCEAN");
    await page.waitForFunction('document.querySelector("#loading-lp") === null');
    expect(Number(balance)).toBeGreaterThan(0);
  });

  it("Stake button is disabled when input = 0", async () => {
    const btnText = await getExecuteButtonText(page, "unstake", "Enter");
    expect(btnText).toBe("Enter Amount To Remove");
    expect(await page.waitForSelector("#executeUnstake[disabled]", { timeout: 1500 })).toBeTruthy();
  });

  it("Stake button is enabled when input is > 0", async () => {
    const shares = await getSharesFromUnstake(page);
    const { input, receive } = await inputUnstakeAmt(page, "1", shares || "");
    expect(Number(input)).toBeGreaterThan(0);
    expect(Number(receive)).toBeGreaterThan(0);
    expect(await page.waitForSelector("#executeUnstake[disabled]", { timeout: 1500 })).toBeFalsy();
    const btnText = await getExecuteButtonText(page, "unstake", "Withdrawal");
    expect(btnText).toBe("Withdrawal");
  });

  // it("Stake button is disabled when input > balance", async () => {});
  it("Transactions for less than .01 ocean are not allowed", async () => {
    await clearInput(page, "#unstakeAmtInput");
    const shares = await getSharesFromUnstake(page);
    const { input, receive } = await inputUnstakeAmt(page, "1", shares || "");
    expect(Number(input)).toEqual(0.0001);
    expect(Number(receive)).toBeLessThan(0.01);
    const btnText = await getExecuteButtonText(page, "unstake", "Minimum");
    expect(btnText).toBe("Minimum Removal is .01 OCEAN");
  });

  // it("Max button disabled before token is selected", async () => {});

  it("Max unstake should limit input when less than user shares", async () => {
    const shares = await getSharesFromUnstake(page);
    const { input, receive } = await inputUnstakeAmt(page, "max", shares || "");
    expect(Number(input)).toBeGreaterThan(0);
    expect(Number(receive)).toBeGreaterThan(0);
    const btnText = await getExecuteButtonText(page, "unstake", "Withdrawal");
    expect(btnText).toBe("Withdrawal");
  });

  it("Shows connect wallet modal when there is no wallet connected", async () => {
    await page.reload();
    const element = await useXPath(page, "div", "Connect your wallet to continue.", false);
    expect(element).toBeTruthy();
  });
  it("Shares updates when connecting wallet", async () => {
    await quickConnectWallet(page);
    const shares = await getSharesFromUnstake(page);
    expect(Number(shares)).toBeGreaterThan(0);
  });

  it("Shares should limit input when less than max stake", async () => {
    await switchAccounts(metamask, page, 2, true);
    await page.bringToFront();
    const shares = await getSharesFromUnstake(page);
    if (Number(shares) === 0) {
      expect(await page.waitForSelector("#maxUnstakeBtn[disabled]", { timeout: 1500 })).toBeTruthy();
    } else {
      const shares = await getSharesFromUnstake(page);
      const { input, receive } = await inputUnstakeAmt(page, "max", shares || "");
      expect(Number(input)).toBe(100);
      expect(Number(receive)).toBeGreaterThan(0);
      const btnText = await getExecuteButtonText(page, "unstake", "Withdrawal");
      expect(btnText).toBe("Withdrawal");
    }
  });
});
