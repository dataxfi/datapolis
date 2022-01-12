import puppeteer from "puppeteer";
import * as dappeteer from "@chainsafe/dappeteer";
import "regenerator-runtime/runtime";

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
    await metamask.page.waitForSelector(".home__container");
    await metamask.page.waitForSelector("li[data-testid=home__activity-tab] > button");
    await metamask.page.click("li[data-testid=home__activity-tab] > button");
    await metamask.page.waitForSelector(".transaction-status.transaction-status--unapproved");
    await metamask.page.reload();

    await metamask.page.waitForSelector(".btn-primary");
    await metamask.confirmTransaction();
    page.bringToFront();
  }
}

export async function setUpSwap(page: puppeteer.Page, t1Symbol: string, t2Symbol: string, t1Amount: string) {
  //open modal for token 1
  await page.waitForSelector("#selectToken1");
  await page.click("#selectToken1");

  //click ocean
  await page.waitForSelector(`#${t1Symbol}-btn`);
  await page.click(`#${t1Symbol}-btn`);

  //open modal for token 2
  await page.waitForSelector("#selectToken2");
  await page.click("#selectToken2");

  //click sagkri-94
  await page.waitForSelector(`#${t2Symbol}-btn`);
  await page.click(`#${t2Symbol}-btn`);

  if (t1Amount === "max") {
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

export async function confirmAndCloseTxDoneModal(page: puppeteer.Page) {
  await page.waitForSelector("#transactionDoneModal");
  await page.waitForSelector("#transactionDoneModalCloseBtn");
  await page.click("#transactionDoneModalCloseBtn");
}
