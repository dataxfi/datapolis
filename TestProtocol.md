# 🧑‍🔬 Manual test protocol for DataX 👩‍🔬



> Keep the following in mind when completing this form:
>
> 1 - The following processes can be completed regularly to identify any issues upon creating a new bug fix or enhanchement. This protocol assumes you have a significant amount of OCEAN token or liquidity to be able to complete all of these tests. If you need ocean visit the <a href="https://faucet.rinkeby.oceanprotocol.com/send?address=0x7c8a5A7c34C8D9Bff143bEf41EaFfaAb8d543c87"> ocean faucet </a>.🧪
>
> 2 - Open your developer tools in your browser and monitor errors during testing. Make a note of any errors and try to identify what is causing it. If it is not being handled properly, raise the concern during standup or reach out on discord to see whether an issue should be opened.🧬
>
> 3 - These tests do not include previous checks, a checkbox in one test will not appear exactly the same way in another (unless it is a rare scenario or extremely important). Please ensure the <a href="#standards">Standard Checks</a> occur with each transaction, and check back here if something you expected to occur doesn't. Check dev tools for an error issue if you spot something out of the ordinary, then follow directions in B (above).🧲
>
> 4 - Some tests require you to do things a particular order, or in a particular timeframe. If you miss a checkbox because a notification timed out or something, just make another transaction and test only that one thing.🧮
>
> 5 - If you need to open an issue, check there isn't a similar closed issue for the same bug first. If there is just reopen it, comment, and make sure it is in the TODO column in the DataX project board, or assign it to yourself and place it in IN PROGRESS when you work on it.📐
>
> 6 - If a test requires you to close the Transaction Loader modal before signing the transactions, if there is more than 1 transaction you can proceed with the test as usual if you accidentally sign the first transaction.🔬
>
> 7 - Each test has a step overview to be read in entirety before completing the steps, or else you will probably miss a checkbox. Read the steps then go through the checkboxes, refer back to the step overview while checking the boxes.🥼
>
> 8 - This is a pretty thorough set of tests, if you're testing a new feature or bug fix test only the products it affects. (I.E. If you only add code to swap.tsx, only test swap.tsx. If you make changes to the transaction loader modal, test a each place the modal is used.)⚗️


## Quick Navigation: 
<ul>
<a href="#tradex"> TradeX Tests</a>
<p>---🤖---</p>
<a href="#stakex"> StakeX Tests</a>
<p>---🥼---</p>
<a href="#LP"> Liquidity Position Tests</a>
<p>---🔬---</p>
<a href="#remove"> Remove Liquidity Tests</a>
<ul>



## <h2 id="standards">Standard Checks ✅</h2>

| ( ✅ = always )                                                                  | TradeX    | StakeX | Remove Stake | Liquidity Position |
| -------------------------------------------------------------------------------- | -----------------------------------------------------------------------------------------| ------ | ------------ | -- |
| Preview Transaction Modal Appears                                                | ✅                                                                                                                              |        |  | |
| Transaction Loader Modal Appears                                                 | ✅                                                                                                                              | ✅ | ✅  | |
| Snackbar appears when transaction<br /> completes                               | ✅                                                                                                                              | ✅  | ✅ |✅ |
| Approval Transaction (in wallet)                                                            | <p>When trading ocean <br /> in any way or <br /> trading any DT for <br /> the first time in a <br /> DT to DT transaction.<p> | ✅  | ✅ | |
| Transaction Confirmation (in wallet)                                                        | ✅                                                                                                                              | ✅  | ✅   | |
| Pending Indicator is visible when <br /> the Transaction Loader Modal is closed | ✅                                                                                                                              | ✅  | ✅ |✅ |
| At any given moment there are no <br /> errors in the console.                          | ✅                                                                                                                              | ✅  | ✅ |✅ |
| Pool information is shown for each pool. | | ✅ |  |✅ |
## <h2 id="tradex">🔄 TradeX 🔄</h2> 

> Complete the transactions to test limits of TradeX (Rinkeby)

<hr>

**1) Complete a low amount transaction and test transaction modals.** 🧪

- .1 OCEAN to DT
- Slippage default (1%)

- Leave the loader modal open for the duration of the transaction.
- Click on the link in the transaction done modal.

- Ensure the following things occur:

   <input type = "checkbox">
    Transaction preview modal opens

   <input type = "checkbox">
    Transaction Loader modal opens

   <input type = "checkbox">
    Wallet asks for approval to access OCEAN

   <input type = "checkbox">
    Wallet asks to swap OCEAN for DT

   <input type = "checkbox">
    Loader modal closes upon transaction response

   <input type = "checkbox">
    Transaction success modal opens

   <input type = "checkbox">
    Transaction (in transaction success modal) link takes you to transaction

  <textarea rows="10" cols="100">Write notes here, expand text area so you can take screenshots and save your notes for discussion..</textarea>

<hr>

**2) Complete a typical amount transaction, test slippage, snackbar, Exchange Rate, and pending indicator** 🧬

- OCEAN to Datatoken
- Slippage to 3%
- Type 1 ocean in the input.
- Check the Exchange Rate matches what you see in the input, take a note of this exchange rate.
- Swap the tokens.
- Type 1 DT in the input.
- Check the Exchange Rate matches what you see in the input.
- Swap the tokens back.
- Check the exchange rate is the same as your initial check.
- Type in 10 ocean.
- Multiply your noted Exchange Rate by 10 and check the value.
- Press approve and swap.
- Close the loader modal immediately (after preview transaction modal).
- Click on the link in the snackbar.

- Ensure the following things occur:

   <input type = "checkbox">
   Exchange rate is correct for OCEAN to DT. (make note)

   <input type = "checkbox">
   Swap button swaps tokens and resets values.

   <input type = "checkbox">
   Exchange Rate is correct for DT to OCEAN. (swap back)

   <input type = "checkbox">
   Exchange Rate is correct for OCEAN to DT. (same as noted earlier)

   <input type = "checkbox">
   Ensure the slippage matches your input (3%).

   <input type = "checkbox">
   Close transaction modal before approving first transaction.

   <input type = "checkbox">
   Pending indicator appears in navbar after closing the loader modal. (then approve and confirm both)

   <input type = "checkbox">
   Pending indicator dissapears after getting a transaction response.

   <input type = "checkbox">
   The link in the snackbar takes you to the transaction.

   <input type = "checkbox">
   The snackbar dissapears after about 8 seconds.

    <input type = "checkbox">
    The transaction success modal DOESNT appear when the transaction loader modal was closed early. 

  <textarea rows="10" cols="100" placeholder="Write notes here, expand text area so you can take screenshots and save your notes for discussion.."></textarea>

  <hr>

**3) Complete a percentage transaction, test percent input, and transaction history modal.** ⚗️

_Try this test with an account with at least 100 ocean in it, and no more than 250. If you have more, transfer some to another account._

- OCEAN to DT
- Type 50 into the ocean percent input (right side of input)
- Close the loader modal upon opening
- Open the transaction history modal before approving anything in your wallet
- Ensure the following things occur:

   <input type = "checkbox">
   Transaction Loader modal opens (close it before signing transactions).

   <input type = "checkbox">
   Pending indicator appears in navbar after closing the loader modal

   <input type = "checkbox">
   Transaction history modal shows your previous two transactions.

   <input type = "checkbox">
   Transaction history modal shows your current transaction is pending.

   <input type = "checkbox">
   Previous transaction links are green and take you to the corresponding transactions.

   <input type = "checkbox">
   Link in transaction history modal is white and takes you to your account overview.

   <input type = "checkbox">
   Wallet asks for approval to access OCEAN.

   <input type = "checkbox">
   Wallet asks to swap OCEAN for DT.

   <input type = "checkbox">
   Pending indicator dissapears after getting a transaction response.

   <input type = "checkbox">
   The snackbar appears.

   <input type = "checkbox">
   Transaction history modal shows your transaction is indexing after getting a transaction response.

   <input type = "checkbox">
   The snackbar dissapears after about 8 seconds.

   <input type = "checkbox">
   Link in transaction history modal is green and takes you to your transaction.

  <textarea rows="10" cols="100" placeholder="Write notes here, expand text area so you can take screenshots and save your notes for discussion.."></textarea>

  <hr>

**3) Complete a large transaction, test rejected transaction error message, max button (on sell token).** 🔭

_You will most likely need over a thousand ocean to complete this test, reach out on discord (development_internal) if you need a sizable amount of test OCEAN._

- OCEAN to DT
- On an account with a large balance, press the MAX button.
- If the max is 100 percent of your balance, get more OCEAN.
- Calculate the percentage of the token amount out of your balance.

        (Balance / Token Amount) * 100 = Percent

- Check that your calculated percent matches the percent input after pressing the max button.
- Approve and swap.
- Reject the approval transaction.
- Approve and swap.
- Approve the first transaction and reject the swap transaction.
- Approve and swap.
- Take a screenshot of the transaction preview modal.
- Navigate to the transaction in the explorer (via the transaction done modal, the snackbar, or the transaction history modal.)
- Compare the transaction results in the explorer with the expectations described in the preview transaction modal. (Check final amount you received.)

- Ensure the following things occur:

   <input type = "checkbox">
    The max percentage is less than 100% of your balance.

   <input type = "checkbox">
    Your calculated percent matches the percent input after pressing the max button.

   <input type = "checkbox">
    An error message saying "User Rejected Transaction." appears after rejecting the approval transaction.

    <input type = "checkbox">
    The error message dissapears after about 5 seconds. (Approve and swap again.)

   <input type = "checkbox">
    The same error message as before appears after rejecting the transaction confirmation. (Approve and swap again, take a screenshot of preview modal.)

   <input type = "checkbox">
    Take a screenshot of the transaction preview modal.

   <input type = "checkbox">
   The transaction details in the explorer match the expectations defined in the preview transaction modal.

  <textarea rows="10" cols="100" placeholder="Write notes here, expand text area so you can take screenshots and save your notes for discussion.."></textarea>

  <hr>

**4) Complete a small DT to DT transaction, test max button (sell and buy), and swap tokens**  🧮 

_If you dont currently own a small amount of two different datatokens, buy 1 or less of two different datatokens._

- DT to DT
- Press max button of sell DT.
- If max is less than 100 percent of your DT, sell some of that DT back to ocean, then restart this test.
- Press the max button of the buy DT, nothing should change.
- Swap the tokens
- Press the max button of the sell DT.
- If max is less than 100 percent of your DT, sell some of that DT back to ocean, then restart this test.
- Press the bax button of the buy DT, nothing should change.
- Approve and Swap
- Navigate to the transaction in the explorer and verify the details. 

- Ensure the following things occur:

   <input type = "checkbox">
    The max is 100 percent of your balance.

   <input type = "checkbox">
    There preview transaction modal DOESNT appear.

   <input type = "checkbox">
    There is only one transaction in the approve modal.
    
   <input type = "checkbox">
    If you have never sold the sell token before, you will have to approve and swap. If you have sold the datatoken before, you will only have to swap.

   <input type = "checkbox">
   The transaction details in the explorer match the expectations defined in the transaction loader modal.

  <textarea rows="10" cols="100" placeholder="Write notes here, expand text area so you can take screenshots and save your notes for discussion..">Really make sure there are no console errors during this test.</textarea>

  <hr>

**5) Complete a large DT to DT transaction, test max button (sell and buy), and swap tokens** 🔬

_If you dont currently own a substantial amount of two different datatokens, buy about 20 of two datatokens, or however much is avialable of two datatokens._

- DT to DT
- Press max button of sell DT.
- If max is 100 percent of your DT, buy more (with ocean), then restart this test.
- Press the max button of the buy DT, nothing should change.
- Swap the tokens
- Press the max button of the sell DT.
- If max is 100 percent of your DT, buy more (with ocean), then restart this test.
- Press the bax button of the buy DT, nothing should change.
- Approve and Swap
- Navigate to the transaction in the explorer and verify the details. 

- Ensure the following things occur:

   <input type = "checkbox">
    The max buy is less than 100 percent of your balance.

   <input type = "checkbox">
    There preview transaction modal DOESNT appear.

   <input type = "checkbox">
    There is only one transaction in the approve modal.
    
   <input type = "checkbox">
    If you have never sold the sell token before, you will have to approve and swap. If you have sold the datatoken before, you will only have to swap.

    <input type = "checkbox">
   The transaction details in the explorer match the expectations defined in the transaction loader modal.

  <textarea rows="10" cols="100" placeholder="Write notes here, expand text area so you can take screenshots and save your notes for discussion..">Really make sure there are no console errors during this test.</textarea>

  <hr>

## <h2 id="stakex">🐖 StakeX 💵</h2>

**1) Stake a small amount in a pool, check token modal, links, pool information, transaction loader and success modal.**  📐 

- Select any datatoken
- Click the pool link
- Click the token link 
- Check the pool information
  - Open another tab and go to tradeX
  - Select the same dt to sell and ocean to buy
  - Check the swap rate is the same (enter one DT to sell)
- Stake 1 OCEAN token in the pool
- Do NOT close the transaction loader modal.

- Ensure the following things occur:

   <input type = "checkbox">
    The ocean token is not available in the token modal.

   <input type = "checkbox">
    The pool button goes to the pool address in the explorer. 

   <input type = "checkbox">
    The token button goes to the datatoken address in the explorer. 

   <input type = "checkbox">
    The swap rate is the same as the exchange rate on TradeX.

    <input type = "checkbox">
    The transaction details in the explorer match the expectations defined in the transaction loader modal.

    <input type = "checkbox">
    The Transaction Loader Modal opens and shows 2 transactions.
    
    <input type = "checkbox">
    Wallet asks for approval to access OCEAN

   <input type = "checkbox">
    Wallet asks to stake ocean

    <input type = "checkbox">
    The successful Transaction modal opens when after the Transaction loader modal closes.

    <input type = "checkbox">
    Input is reset to 0 and button is reset to "Enter OCEAN Amount"

  <textarea rows="10" cols="100" placeholder="Write notes here, expand text area so you can take screenshots and save your notes for discussion.."></textarea>

  <hr>

**2) Stake a large amount in a pool, test Max stake button, check stake information matches on Liquidity position, snackbar, pending TX indicator.** 🧫 

_This test requires you to have either done the test above and use the same DT from that test, or have previously staked OCEAN in the DT you use for this test. This test requires at least 100 and at most 250 ocean in your account, if you have more than 250 transfer some to another account._

- Select any datatoken
- Press "Max Stake", if the stake amount is less than your balance, sell some OCEAN tokens in TradeX. 
- Open a new tab and navigate to your liquidity position page on StakeX
- Check that the Pool liquidity matches between StakeX and the liquidity position page.
- Immediately close the transaction loader modal.

- Ensure the following things occur:
  
   <input type = "checkbox">
    Max stake input after pressing max stake is your total balance. 

    <input type = "checkbox">
    The Pool Liquidity matches the information in the liquidity position page for the DT pool you have selected.  

    <input type = "checkbox">
    Close the transaction loader modal before you sign the transactions. 

    <input type = "checkbox">
    Pending transaction indicator appears in the snackbar after closing the transaction loader modal. 

    <input type = "checkbox">
    Snackbar appears when the transaction is complete.

    <input type = "checkbox">
    The transaction success modal DOESNT appear when the transaction loader modal was closed early.

  <textarea rows="10" cols="100" placeholder="Write notes here, expand text area so you can take screenshots and save your notes for discussion.."></textarea>

  <hr>

  **3) Stake a the max amount in a pool, test Max stake button, test the transaction history modal.** 🥼

_This test requires you to have a considerable amount of OCEAN, probably around 500 to 2000 OCEAN. You can attempt this but may need to aquire more ocean. If you own alot of the DT you use in this test, you will need even more OCEAN. Consider selling some or all of the DT you use in this test if you dont have enough OCEAN._

- Select any datatoken
- Press "Max Stake", if the stake amount is 100% of your balance, aquire more ocean token. 
- Immediately close the transaction loader modal.
- Open the transaction history modal before approving the transactions.
- Watch the transaction until it is successful.

- Ensure the following things occur:
  
   <input type = "checkbox">
    Max stake input after pressing max stake is less than your.  

    <input type = "checkbox">
    The Pool Liquidity matches the information in the liquidity position page for the DT pool you have selected.  

    <input type = "checkbox">
    Close the transaction loader modal before you sign the transactions and open the transaction history modal. 

    <input type = "checkbox">
    The transaction in the history modal says 'pending' in the transaction history modal. 

    <input type = "checkbox">
    When transaction in the history says 'pending' modal has a white link to the explorer that goes to your account address.

    <input type = "checkbox">
    The pending transaction indicator dissapears when a response from the transaction is received.

    <input type = "checkbox">
    The transaction in the history modal changes to 'indexing' when a response from the transaction is received. 

    <input type = "checkbox">
    The pending transaction indicator dissapears when a response from the transaction is received.
    
    <input type = "checkbox">
    When the transaction in the history modal says 'indexing' the link is green and goes to the transaction in the explorer.

    <input type = "checkbox">
    The transaction says 'Success' shortly before or after the transaction reports successful in the explorer (-+ 30 seconds especially depending on your internet connection).

    <input type = "checkbox">
    The transaction success modal DOESNT appear when the transaction loader modal was closed early.
     
  <textarea rows="10" cols="100" placeholder="Write notes here, expand text area so you can take screenshots and save your notes for discussion.."></textarea>

  <hr>
### <h2 id="LP">Liquidity Position</h2>

**1)Check LP page has proper information, is loading only on first access, and you can view multiple at once.** 🥼 

- Navigate to the liquidity position page.
- Take a screenshot of the information of a pool. **(The tokens in the pools you use in this test need to also be in the token list.)** 
- Navigate to and check values against the pool information in StakeX page (Do not use another tab)
    - Specifically check the 'Pool liquidity' information is the same.
- Check your liquidity position doesn't reload when you navigate back to the liquidity position page.
- Repeat process for two more pools.
- View the information for multiple pools.
- Ensure the following things occur:
  
   <input type = "checkbox">
    The liquidity pool information is loaded the first time you open the liquidity position page. 

    <input type = "checkbox">
    The pool information for 3 pools is the same on StakeX and StakeX liquidity position page.

    <input type = "checkbox">
    The pool information never reloads when moving between StakeX and StakeX liquidity position page. 

    <input type = "checkbox">
    You can open multiple pool information sections and scroll up and down on the page. 

  <textarea rows="10" cols="100" placeholder="Write notes here, expand text area so you can take screenshots and save your notes for discussion.."></textarea>

  <hr>

  **2)Check the LP information updates after transactions** 🧲

- Navigate to the liquidity position page.
- Wait for loading to complete, open a pool, and make a note or screenshot of your information. 
- Navigate back to StakeX, and make a transaction in the pool you noted information for. 
- Wait for the transaction to complete. 
- Navigate back to liquidity position page.
- Check that the LP information is loading again, or has already loaded. 
- Check that your pool information is updated for the pool you added stake to.
- Take a note or screenshot of the new information or the information of a different pool.
- Navigate to the remove liquidity page. 
- Remove liquidity. 
- Wait for a successful transaction. 
- Navigate back to the LP page
- Check that the LP information is loading again, or has already loaded. 
- Check that your pool information is updated for the pool you removed stake from.
- Ensure the following things occur:

    <input type = "checkbox">
    The pool information is updated after staking in a pool.

    <input type = "checkbox">
    The pool information is updated after unstaking in a pool.

  <textarea rows="10" cols="100" placeholder="Write notes here, expand text area so you can take screenshots and save your notes for discussion.."></textarea>

  <hr>


### <h2 id="#remove">Remove Liquidity</h2>

  **1)Remove a small amount of stake, check button is disabled in appropriate states, the transaction loader modal, transaction success modal.** 🧲

- Navigate to the remove liquidity page for any pool you have stake in. (Add stake if you have none.)
- Enter 1 (1%) into the input. 
- Remove stake 
- DONT close transaction loader modal
- Check tx success modal link
- Check button states throughout process.

    <input type = "checkbox">
    The input calculates the OCEANS removed. 

    <input type = "checkbox">
    The transaction loader modal shows two transactions to approve.

    <input type = "checkbox">
    The button is disabled while the transaction is processing.

    <input type = "checkbox">
    The transaction loader modal closes when a response is received. 

    <input type = "checkbox">
    The transaction success modal opens when the transaction loader modal closes. 

    <input type = "checkbox">
    The link in the transaction success modal opens the transaction in the explorer. 

  <textarea rows="10" cols="100" placeholder="Write notes here, expand text area so you can take screenshots and save your notes for discussion.."></textarea>

  <hr>
  **2) Remove 50 percent of a decent amount of shares, check the snackbar, pending transaction indicator, and stake loading after transaction.** 🧲

    _Stake ocean in a pool until you have shares that are worth over 100 ocean before trying this test_

    - Type 50 percent in the input field
    - Take note of current shares amount
    - Immediately close the transaction loader modal
    - Wait for LP information to reload after transaction 

    <input type = "checkbox">
    Close the transaction loader modal before signing transactions.

    <input type = "checkbox">
    The pending transaction indicator appears in the navbar when after closing the transaction loader modal. 

    <input type = "checkbox">
    The button to remove stake is disabled and says 'processing transaction' while the transaction is processing.

    <input type = "checkbox">
    The snackbar appears when a response from the transaction is received.  

    <input type = "checkbox">
    The link in the snackbar navigates to the transaction.

    <input type = "checkbox">
    The liqiuidity information reloads when a response from the transaction is received.  

    <input type = "checkbox">
    The remove stake button is disabled and says "Loading your stake information" while loading the stake information. 

    <input type = "checkbox">
    The transaction done modal DOESNT open when a response from the transaction is received. 

    <input type = "checkbox">
    The shares amount is updated after or while the LP information is finished loading. 

    <input type = "checkbox">
    The remove stake button is enabled after the LP information is finished loading.

  <textarea rows="10" cols="100" placeholder="Write notes here, expand text area so you can take screenshots and save your notes for discussion.."></textarea>

  <hr>

    **2) Remove max unstake of total shares, max unstake button, check tx history modal.** 🧲

    - Press the max unstake button. **(If the max unstake is less than 100 percent of your shares, remove stake until it is 100 percent of your shares.)**
    - Take note of the Receive amount and percent.
    - Clear the input field then type 100 percent in the input field, nothing should change.
    - Approve and withdrawal.
    - Immediately close the transaction loader modal. 
    - Open the tx history modal before signing the transactions.
    - Wait for the transaction to succeed.

    <input type = "checkbox">
    Pressing the max unstake button and typing 100% achieves the same result.

    <input type = "checkbox">
    The transaction in the history modal says "pending"

    <input type = "checkbox">
    While the transaction is 'pending' in history modal, there is a white link to your account address on the explorer.

    <input type = "checkbox">
    The transaction changes to 'indexing' when after receiving a response from the transaction.  

    <input type = "checkbox">
    While the transaction is 'indexing' in history modal, there is a green link to the transaction on the explorer. 

    <input type = "checkbox">
    The transaction says 'Success' shortly before or after the transaction reports successful in the explorer (-+ 30 seconds especially depending on your internet connection).

  <textarea rows="10" cols="100" placeholder="Write notes here, expand text area so you can take screenshots and save your notes for discussion.."></textarea>

  <hr>