import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { setupDappBrowser, setupDataX, closeBrowser, quickConnectWallet } from "./Setup";
import {
  getShares,
  navToLp,
  navToRemoveStake,
  navToStake,
  navToTrade,
  getBalanceInMM,
  navToStakeWPool,
  navToLpFromUnstake,
  acceptCookies,
} from "./Utilities";

describe("User Interface Works as Expected", () => {
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
    await page.bringToFront()
    await acceptCookies(page)
  });

  afterAll(async () => {
    await closeBrowser(browser);
  });

  it("Should have OCEAN balance > 0 to run these tests", async () => {
    const balance = await getBalanceInMM(metamask, "OCEAN");
    await page.waitForFunction('document.querySelector("#loading-lp") === null')
    expect(Number(balance)).toBeGreaterThan(0);
  });

  //General Navigation
  it("Can navigate to StakeX", async () => {
    await navToStake(page);
    expect(await page.waitForSelector("#stakeModal")).toBeDefined();
  });
  it("Can navigate to TradeX from StakeX", async () => {
    await navToStake(page);
    await navToTrade(page);
    expect(await page.waitForSelector("#swapModal")).toBeDefined();
  });
  it("Can navigate to LP from StakeX", async () => {
    await navToLp(page);
    expect(await page.waitForSelector("#lpModal")).toBeDefined();
  });
  it("Can navigate to Unstake from LP", async () => {
    await navToRemoveStake(page, "SAGKRI-94");
    expect(await page.waitForSelector("#removeStakeModal")).toBeDefined();
  });
  it("Can reload on Unstake", async () => {
    await page.reload();
    await quickConnectWallet(page)
    expect(await page.waitForSelector("#removeStakeModal")).toBeDefined();
    // const shares = await getShares(page);
    // expect(Number(shares)).toBeGreaterThan(0);
  });
  it("Can navigate to LP from unstake", async () => {
    await navToLpFromUnstake(page);
    expect(await page.waitForSelector("#lpModal")).toBeDefined();
  });
  it("Can navigate to Stake from LP", async () => {
    await navToLp(page);
    await navToStakeWPool(page, "SAGKRI-94");
    await page.waitForSelector("#stakeToken");
    const text = await page.evaluate('document.querySelector("#stakeToken").innerText');
    expect(text).toBe("SAGKRI-94");
  });
  it("Can reload on Stake with token selected", async () => {
    await page.reload();
    await quickConnectWallet(page)
    await page.waitForSelector("#stakeToken");
    const text = await page.evaluate('document.querySelector("#stakeToken").innerText');
    expect(text).toBe("SAGKRI-94");
  });

  // //TradeX
  // it("Max exchange should limit input when less than balance", async () => {});
  // it("Balance should limit input when less than max exchange");
  // it("Balance is same in dapp and MM", async () => {});
  // it("Inputs are reset to 0 when token 1 or 2 changes", async () => {});
  // it("Perc is reset when token 1 or 2 changes ", async () => {});
  // it("If balance is 0: max disabled, perc disabled, ", async () => {});
  // it("If balance is 0 the button says not enough token", async () => {});
  // it("Swap rate in tradex and stakex are the same", async () => {});
  // it("Transactions for less than .01 ocean are not allowed", () => {});
  // it("Swap button should swap tokens", async () => {});
  // it("Trade button is: disabled when input = 0, enabled when input is > 0, disabled when input > balance", () => {});
  // it("Trade button says select token when before token is selected", async () => {});
  // it("Trade button says enter ocean amount when token is selected", async () => {});
  // it("Trade button says unlock or stake when token input is entered", async () => {});

  // //StakeX
  // it("Balance is same in dapp and MM", async () => {});
  // it("Check transactions for less than .01 ocean are not allowed", async () => {});
  // it("Max stake should limit input when less than user balance", async () => {});
  // it("Balance should limit input when less than max stake", async () => {});
  // it("Stake button is: disabled when input = 0, enabled when input is > 0, disabled when input > balance", () => {});
  // it("Stake button says select token when before token is selected", async () => {});
  // it("Stake button says enter ocean amount when token is selected", async () => {});
  // it("Stake button says unlock or stake when token input is entered", async () => {});
  // it("Balance updates when connecting wallet", async () => {});
  // it("Max button disabled before token is selected", async () => {});
  // it("Pool information is empty before token is selected", async () => {});
  // it("Max button is enabled when token is selected", async () => {});
  // it("Pool informatino loads when token is selected", async () => {});
  // it("All buttons change color on hover", async () => {});

  // //LP
  // it("Should be able to import any pool", async () => {});
  // it("Should be able to navigate to stake and preload token", async () => {});
  // it("Should be able to navigate to unstake and preload token", async () => {});
  // it("Remove button is disabled when user has 0 stake", async () => {});
  // it("Should be show the same user information on pool and stake page", async () => {});

  // //Unstake
  // it("Check transactions for less than .01 ocean are not allowed", async () => {});
  // it("Stake button is: disabled when input = 0, enabled when input is > 0, disabled when input > balance", async () => {});
  // it("Stake button says select token when before token is selected", async () => {});
  // it("Stake button says enter ocean amount when token is selected", async () => {});
  // it("Stake button says unlock or stake when token input is entered", async () => {});
  // it("Balance updates when connecting wallet", async () => {});
  // it("Max button disabled before token is selected", async () => {});
  // it("Max unstake should limit input when less than user balance", async () => {});
  // it("Balance should limit input when less than max stake", async () => {});

  // //Unlock token modal
  // it("There should be a token that needs unlocked for these tests", async () => {});
  // it("Buttons are disabled while transaction is processing", async () => {});
  // it("Error message should show when transaction is denied", async () => {});
  // it("Modal dissapeard when transaction is denied", async () => {});
  // it("Exectute transaction button does not change when transaction is denied", async () => {});

  // //token modal
  // it("Should be able to retieve a token list", async () => {});
  // it("Token list should work on tradex input 1 and 2", async () => {});
  // it("Token list should work on stakex", async () => {});
  // it("Token list should work on liquidity position", async () => {});
});
