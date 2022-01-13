import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";
import { testAcctId } from "./Setup";

export async function clearMMPopup(metamask: dappeteer.Dappeteer) {
  //clear popoups
  try {
    await metamask.page.waitForSelector(".fas.fa-times.popover-header__button", { timeout: 5000 });
    await metamask.page.click(".fas.fa-times.popover-header__button");
  } catch (error) {}
}

export async function approveTransaction(metamask: dappeteer.Dappeteer) {
  //click activity tab
  await metamask.page.waitForSelector("li[data-testid=home__activity-tab] > button");
  await metamask.page.click("li[data-testid=home__activity-tab] > button");
  //click tx and confirm
  await metamask.page.waitForSelector(".list-item.transaction-list-item.transaction-list-item--unconfirmed");
  await metamask.page.click(".list-item.transaction-list-item.transaction-list-item--unconfirmed");
  await metamask.page.waitForSelector(".btn-primary", { timeout: 45000 });
  await metamask.confirmTransaction();
}

export async function approveTransactions(metamask: dappeteer.Dappeteer, page: puppeteer.Page, txAmount: number) {
  //open MM
  await metamask.page.bringToFront();
  await clearMMPopup(metamask);
  await approveTransaction(metamask);
  await clearMMPopup(metamask);
  for (let tx = 1; tx < txAmount; tx++) {
    //wait for second tx, click and confirm
    try {
      await metamask.page.waitForSelector(".home__container");
      await metamask.page.waitForSelector("li[data-testid=home__activity-tab] > button");
      await metamask.page.click("li[data-testid=home__activity-tab] > button");
      await metamask.page.waitForSelector(".transaction-status.transaction-status--unapproved");
      await metamask.page.reload();

      await metamask.page.waitForSelector(".btn-primary");
      await metamask.confirmTransaction();
      page.bringToFront();
    } catch (error) {
      console.log(error);
    }
  }
}

export async function setUpSwap(page: puppeteer.Page, t1Symbol: string, t2Symbol: string, t1Amount: string) {
  //open modal for token 1
  await page.waitForTimeout(1000);
  await page.waitForSelector("#selectToken1");
  await page.click("#selectToken1");

  //click ocean
  await page.waitForSelector(`#${t1Symbol}-btn`);
  await page.click(`#${t1Symbol}-btn`);

  //open modal for token 2
  await page.waitForTimeout(1000);
  await page.waitForSelector("#selectToken2");
  await page.click("#selectToken2");

  //click sagkri-94
  await page.waitForSelector(`#${t2Symbol}-btn`);
  await page.click(`#${t2Symbol}-btn`);

  if (t1Amount === "max") {
    await page.waitForTimeout(1000);
    await page.waitForSelector("#maxTrade");
    await page.click("#maxTrade");
    await page.waitForFunction('Number(document.querySelector("#token1-input").value) > 0');
  } else {
    //input 10 into token 1
    await page.waitForSelector("#token1-input");
    await page.click("#token1-input");
    await page.type("#token1-input", t1Amount, { delay: 100 });
  }

  //wait for calculation and click approve and swap
  await page.waitForFunction('Number(document.querySelector("#token2-input").value) > 0');
  await page.waitForFunction('document.querySelector("#executeTradeBtn").innerText === "Approve & Swap"');
  await page.waitForTimeout(1000);

  await page.waitForSelector("#executeTradeBtn");
  await page.click("#executeTradeBtn");

  //   if (t1Symbol === "OCEAN") {
  //Confirm modal
  await page.waitForSelector("#confirmSwapModalBtn");
  await page.click("#confirmSwapModalBtn");
  //   }
}
export async function navToStake(page: puppeteer.Page) {
  await page.bringToFront();
  await page.waitForSelector("#StakeX-link");
  await page.click("#StakeX-link");
}

export async function navToLp(page: puppeteer.Page) {
  await navToStake(page);
  await acceptCookies(page);
  await page.waitForSelector("#lpLink");
  await page.click("#lpLink");
  await page.waitForSelector("#lpModal");
}

export async function navToRemoveStake(page: puppeteer.Page, pool: string) {
  await navToLp(page);

  try {
    await page.waitForSelector(`#${pool}-lp-item`, { timeout: 3000 });
  } catch (error) {
    try {
      await importStakeInfo(page, pool);
      await page.waitForSelector(`#${pool}-lp-item`, { timeout: 10000 });
    } catch (error) {
      throw error;
    }
  }
  await page.click(`#${pool}-lp-item`);
  await page.waitForSelector("#lp-remove-link");
  await page.click("#lp-remove-link");
  await page.waitForSelector("#removeStakeModal");
}

export async function acceptCookies(page: puppeteer.Page) {
  await page.waitForSelector("#cookiesModal");
  await page.waitForSelector("#confirmCookies");
  await page.click("#confirmCookies");
  await page.waitForTimeout(500);
}

export async function setupRemoveStake(page: puppeteer.Page, unstakeAmt: string) {
  if (unstakeAmt === "max") {
    await page.waitForSelector("#maxUnstakeBtn");
    await page.click("#maxUnstakeBtn");
    await page.waitForSelector("#unstakeAmtInput");
    await page.waitForFunction('Number(document.querySelector("#unstakeAmtInput").value) > 0');
    await page.waitForSelector("#oceanToReceive");
    await page.waitForFunction('Number(document.querySelector("#oceanToReceive").innerText) > 0');
  } else {
    await page.waitForSelector("#unstakeAmtInput");
    await page.type("#unstakeAmtInput", unstakeAmt, { delay: 150 });
    await page.waitForSelector("#oceanToReceive");
    await page.waitForFunction('Number(document.querySelector("#oceanToReceive").innerText) > 0');
  }

  await page.waitForSelector("#executeUnstake");
  await page.waitForFunction('document.querySelector("#executeUnstake").innerText === "Approve and Withdrawal"');
  await page.waitForTimeout(500);
  await page.click("#executeUnstake");
}

export async function setUpStake(page: puppeteer.Page, stakeToken: string, stakeAmount: string) {
  //open token modal
  await page.waitForSelector("#stakeSelectBtn");
  await page.click("#stakeSelectBtn");

  //selectToken
  await page.waitForSelector(`#${stakeToken}-btn`);
  await page.click(`#${stakeToken}-btn`);
  await page.waitForSelector("#stakeToken");
  await page.waitForFunction("document.querySelector('#stakeToken').innerText === 'SAGKRI-94'");
  await page.waitForSelector("#swapRate");
  await page.waitForSelector("#poolLiquidity");
  await page.waitForSelector("#yourLiquidity");

  //input amount
  if (stakeAmount === "max") {
    await page.waitForSelector("#maxStake");
    await page.click("#maxStake");
    await page.waitForSelector("#stakeAmtInput");
    await page.waitForFunction('Number(document.querySelector("#stakeAmtInput").value) > 0');
  } else {
    await page.waitForSelector("#stakeAmtInput");
    await page.type("#stakeAmtInput", stakeAmount, { delay: 150 });
  }

  //wait for calculation and button
  await page.waitForSelector("#executeStake");
  await page.waitForFunction("document.querySelector('#executeStake').innerText === 'Stake'");
  await page.waitForTimeout(500);
  await page.click("#executeStake");
}

export async function confirmAndCloseTxDoneModal(page: puppeteer.Page) {
  await page.waitForSelector("#transactionDoneModal");
  await page.waitForSelector("#transactionDoneModalCloseBtn");
  await page.click("#transactionDoneModalCloseBtn");
}

export async function confirmTokensClearedAfterTrade(page: puppeteer.Page) {
  await page.waitForFunction('document.querySelectorAll("#selectTokenBtn").length === 2');
  await page.waitForTimeout(500);
}

export async function confirmInputClearedAfterStake(page: puppeteer.Page) {
  await page.waitForSelector("#executeStake");
  await page.waitForFunction("document.querySelector('#executeStake').innerText === 'Enter OCEAN Amount'");
  await page.waitForSelector("#stakeAmtInput");
  await page.waitForFunction("document.querySelector('#stakeAmtInput').value === ''");
}

export async function confirmInputClearedAfterUnstake(page: puppeteer.Page){
  await page.waitForSelector("#executeUnstake")
  await page.waitForFunction('document.querySelector("#executeUnstake").innerText === "Enter Amount to Remove"')
  await page.waitForSelector('#unstakeAmtInput')
  await page.waitForFunction('document.querySelector("#unstakeAmtInput").value === "0"')
}

export async function reloadOrContinue(lastTestPassed: Boolean, page: puppeteer.Page, stake?: boolean) {
  if (lastTestPassed) return;
  page.reload();
  await page.setViewport({ width: 1039, height: 913 });
  await page.waitForSelector("#d-wallet-button");
  await page.click("#d-wallet-button");
  if (stake) navToStake(page);
}

//get method not fully functional
export type methods = "get" | "set" | "clear" | "remove" | "key" | "length";
export async function useLocalStorage(
  page: puppeteer.Page,
  method: methods,
  data?: { key?: string; value?: string; index?: number }
) {
  console.log(data);

  switch (method) {
    case "get":
      if (data)
        return await page.evaluate((data, testAcctId) => window.localStorage.getItem(data.key || ""), data, testAcctId);
      break;
    case "set":
      if (data) await page.evaluate((data) => window.localStorage.setItem(data.key || "", data.value || ""), data);
      break;
    case "clear":
      await page.evaluate(() => window.localStorage.clear());
      break;
    case "key":
      if (data) await page.evaluate((data) => window.localStorage.key(data.index || 0), data);
      break;
    case "length":
      return await page.evaluate(() => window.localStorage.length);
    case "remove":
      if (data) await page.evaluate((data) => window.localStorage.removeItem(data.key || ""), data);
      break;
  }
}

export async function importStakeInfo(page: puppeteer.Page, pool: string) {
  await page.waitForSelector("#importStakeBtn");
  await page.click("#importStakeBtn");

  await page.waitForSelector(`#${pool}-btn`);
  await page.click(`#${pool}-btn`);
}

//not yet tested
export async function hoarder(
  browser: puppeteer.Browser,
  metamask: dappeteer.Dappeteer,
  dumpAcct: string,
  accounts: number
) {
  const context = browser.defaultBrowserContext();
  context.overridePermissions(metamask.page.url(), ["clipboard-read"]);
  const oceanFaucet = await browser.newPage();
  const chainlinkFaucet = await browser.newPage();
  chainlinkFaucet.goto("https://faucets.chain.link/rinkeby");
  oceanFaucet.goto("https://faucet.rinkeby.oceanprotocol.com/send?address=0x7c8a5A7c34C8D9Bff143bEf41EaFfaAb8d543c87");
  metamask.page.bringToFront();
  for (let i = 0; i < accounts; i++) {
    await metamask.page.waitForSelector(".account-menu__icon");
    await metamask.page.click(".account-menu__icon");
    await metamask.page.waitForSelector(".account-menu__item account-menu__item--clickable");
    await metamask.page.click(".account-menu__item account-menu__item--clickable");
    await metamask.page.waitForSelector(".btn-primary");
    await metamask.page.click(".btn-primary");
    await metamask.page.waitForSelector(".selected-account__clickable");
    await metamask.page.click(".selected-account__clickable");
    await metamask.page.waitForTimeout(1000);
    const address = await metamask.page.evaluate(() => navigator.clipboard.readText());
    console.log("Current address:", address);
    await oceanFaucet.bringToFront();
    await oceanFaucet.type(".selected-account__clickable", address);
    await oceanFaucet.click("#createBtn");
    await chainlinkFaucet.bringToFront();
    await chainlinkFaucet.waitForSelector("#accountAddress");
    await chainlinkFaucet.type(address, "#accountAddress");
    await chainlinkFaucet.waitForSelector(".recaptcha-checkbox-border");
    await chainlinkFaucet.click(".recaptcha-checkbox-border");
    await chainlinkFaucet.waitForTimeout(1500);
    await chainlinkFaucet.click(".Box-sc-1vpmd2a-0.Button-sc-1sg3lik-0.kaOPyJ");
  }
}
