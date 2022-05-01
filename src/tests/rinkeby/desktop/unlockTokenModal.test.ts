import puppeteer from 'puppeteer'
import * as dappeteer from '@keithers98/dappeteer-stable'
import 'regenerator-runtime/runtime'
import {
  setupDataX,
  closeBrowser,
  navToTradeXFromLanding,
  setUpSwap,
  getExecuteButtonText,
  executeTransaction,
  unlockTokens,
  closeConfirmSwapModal,
  navToStake,
  approveTransactions,
  confirmAndCloseTxDoneModal,
  confirmTokensClearedAfterTrade,
  selectStakeToken,
  navToTrade,
  goToLocalHost
} from '../../utils'

describe('Execute Standard Trades on Trade', () => {
  jest.setTimeout(300000)
  let page: puppeteer.Page
  let browser: puppeteer.Browser
  let metamask: dappeteer.Dappeteer

  beforeAll(async () => {
    browser = global.browser
    metamask = global.metamask
    page = global.page
    await goToLocalHost(page)
    await navToTradeXFromLanding(page)
    await setupDataX(page, metamask, 'rinkeby', false)
  })

  afterAll(async () => {
    await closeBrowser(browser)
  })

  it('Should unlock tokens permenantly', async () => {
    await setUpSwap(page, metamask, 'OCEAN', 'DAZORC-13', '1', 1)
    const buttonText = await getExecuteButtonText(page, 'trade', 'Unlock')
    expect(buttonText).toBe('Unlock OCEAN')
    await unlockTokens(page, metamask, 'perm')
    await closeConfirmSwapModal(page)
    const newButtonText = await getExecuteButtonText(page, 'trade', 'Swap')
    expect(newButtonText).toBe('Swap')
    await executeTransaction(page, metamask, 'trade')
    await approveTransactions(metamask, page, 1)
    await confirmAndCloseTxDoneModal(page)
    await confirmTokensClearedAfterTrade(page)
    await setUpSwap(page, metamask, 'OCEAN', 'DAZORC-13', '1', 1)
    const newNewButtonText = await getExecuteButtonText(page, 'trade', 'Swap')
    expect(newNewButtonText).toBe('Swap')
  })

  it('Same token pair should be unlocked in Stake', async () => {
    await navToStake(page)
    await selectStakeToken(page, 'DAZORC-13')
    const text = await getExecuteButtonText(page, 'stake', 'Stake')
    expect(text).toBe('Stake')
  })

  it('Should unlock tokens once', async () => {
    await navToTrade(page)
    await setUpSwap(page, metamask, 'OCEAN', 'SAGKRI-94', '1', 1)
    const text = await getExecuteButtonText(page, 'trade', 'Unlock')
    expect(text).toBe('Unlock OCEAN')
    await unlockTokens(page, metamask, 'once')
    await closeConfirmSwapModal(page)
    const newButtonText = await getExecuteButtonText(page, 'trade', 'Swap')
    expect(newButtonText).toBe('Swap')
    await executeTransaction(page, metamask, 'trade')
    await approveTransactions(metamask, page, 1)
    await confirmAndCloseTxDoneModal(page)
    await confirmTokensClearedAfterTrade(page)
    await setUpSwap(page, metamask, 'OCEAN', 'SAGKRI-94', '1', 1)
    const newNewButtonText = await getExecuteButtonText(page, 'trade', 'Swap')
    expect(newNewButtonText).toBe('Swap')
  })

  it('Same token pair should be unlocked in unstake', async () => {
    await navToTrade(page)
    await setUpSwap(page, metamask, 'OCEAN', 'SAGKRI-94', '1', 1)
    const text = await getExecuteButtonText(page, 'trade', 'Unlock')
    expect(text).toBe('Unlock OCEAN')
    await unlockTokens(page, metamask, 'once')
    await closeConfirmSwapModal(page)
    const newButtonText = await getExecuteButtonText(page, 'trade', 'Swap')
    expect(newButtonText).toBe('Swap')
    await navToStake(page)
    await selectStakeToken(page, 'DAZORC-13')
    const newText = await getExecuteButtonText(page, 'stake', 'Stake')
    expect(newText).toBe('Stake')
  })
})
