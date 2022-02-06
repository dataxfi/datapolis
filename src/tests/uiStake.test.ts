import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { setupDappBrowser, setupDataX, closeBrowser, quickConnectWallet } from "./Setup";
import {
  navToStake,
  getBalanceInMM,
  acceptCookies,
  getBalanceInDapp,
  selectStakeToken,
  inputStakeAmt,
  getExecuteButtonText,
  clearInput,
  navToTradeXFromLanding,
  switchAccounts,
} from "./Utilities";
import BigNumber from "bignumber.js";
describe("Stake Platform UI works as expected.", () => {
  jest.setTimeout(300000);
  let page: puppeteer.Page;
  let browser: puppeteer.Browser;
  let metamask: dappeteer.Dappeteer;
  let acc1DapBal: BigNumber, acc1MMBal: BigNumber;

  beforeAll(async () => {
    const tools = await setupDappBrowser(true);
    if (tools) {
      page = tools?.page;
      browser = tools?.browser;
      metamask = tools?.metamask;
    }
    await page.setViewport({ width: 1039, height: 913 });
    await navToTradeXFromLanding(page);
    await navToStake(page);
    acc1DapBal = new BigNumber(await getBalanceInDapp(page, "stake"));
    acc1MMBal = new BigNumber(await getBalanceInMM(metamask, "OCEAN"));
    expect(acc1DapBal.toNumber()).toEqual(0);
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

  it("Balance updates when connecting wallet", async () => {
    const newBalance = await getBalanceInDapp(page, "stake");
    expect(acc1DapBal.toNumber()).toBeLessThan(newBalance);
    acc1DapBal = new BigNumber(newBalance);
  });

  it("Max button disabled before token is selected", async () => {
    expect(await page.waitForSelector("#maxStake[disabled]", {timeout:3000})).toBeTruthy();
  });

  it("Pool information is empty before token is selected", async () => {
    expect(await page.$("#swapRate")).toBeNull();
    expect(await page.$("#poolLiquidity")).toBeNull();
    expect(await page.$("#yourLiquidity")).toBeNull();
  });

  it("Balance is same in dapp and MM", async () => {
    expect(acc1DapBal.toNumber()).toBeCloseTo(acc1MMBal.toNumber());
  });

  it("Stake button is disabled when no token is selected", async () => {
    expect(await page.waitForSelector("#executeStake[disabled]", { timeout: 1500 })).toBeTruthy();
    const text = await getExecuteButtonText(page, "stake", "Select a Token");
    expect(text).toBe("Select a Token");
  });

  
  // it("Stake button is disabled when input > balance", async () => {});
  
  it("Stake button is disabled when input = 0, and execute button says enter ocean amount", async () => {
    expect(await page.waitForSelector("#maxStake[disabled]", {timeout:3000})).toBeTruthy();
    await selectStakeToken(page, "SAGKRI-94");
    const text = await getExecuteButtonText(page, "stake", "OCEAN");
    expect(text).toBe("Enter OCEAN Amount");
  });

  it("Pool information loads when token is selected", async () => {
    expect(await page.waitForSelector("#swapRate", { timeout: 3000 })).toBeTruthy();
    expect(await page.waitForSelector("#poolLiquidity", { timeout: 3000 })).toBeTruthy();
    expect(await page.waitForSelector("#yourLiquidity", { timeout: 3000 })).toBeTruthy();
  });

  it("Max button is enabled when token is selected", async () => {
    expect(await page.$("#maxStake[disabled]")).toBeNull();
  });
  
  it("Stake button is enabled when input is > 0", async () => {
    await inputStakeAmt(page, "1");
    expect(await page.waitForSelector("#executeStake[disabled]", { timeout: 1500 })).toBeFalsy();
    const text = await getExecuteButtonText(page, "stake");
    expect(text === "Stake" || text === "Unlock").toBeTruthy();
  });

  it("Check transactions for less than .01 ocean are not allowed", async () => {
    await clearInput(page, "#stakeAmtInput");
    await inputStakeAmt(page, ".001");
    await page.waitForSelector("#executeStake[disabled]");
    const btnText = await getExecuteButtonText(page, "stake", "Minimum");
    expect(btnText).toBe("Minimum Stake is .01 OCEAN");
  });

  it("Max stake should limit input when less than user balance", async () => {
    const input = await inputStakeAmt(page, "max");
    expect(Number(input)).toBeLessThan(Number(acc1DapBal));
  });

  it("Balance should limit input when less than max stake", async () => {
    await switchAccounts(metamask, page, 2, true);
    const mmBalance = await getBalanceInMM(metamask, "OCEAN");
    const dappBalance = await getBalanceInDapp(page, "stake")
    const input = await inputStakeAmt(page, "max");
    expect(Number(input)).toBeCloseTo(Number(mmBalance))
    expect(Number(dappBalance)).toBeCloseTo(Number(mmBalance))
  });

  // it("All buttons change color on hover", async () => {});
});
