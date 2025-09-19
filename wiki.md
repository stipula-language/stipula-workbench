# **Stipula Workbench**

## **Table of Contents**

1. [Core Concepts: What Makes Stipula Different?](#core-concepts-what-makes-stipula-different)
2. [Using the Stipula Workbench: A Practical Guide](#using-the-stipula-workbench-a-practical-guide)
3. [Common Legal Patterns in Stipula](#common-legal-patterns-in-stipula)
4. [Static Analysis Tools: Ensuring Your Contract is Safe](#static-analysis-tools-ensuring-your-contract-is-safe)
5. [Fragments of Stipula: Understanding Decidability](#fragments-of-stipula-understanding-decidability)
6. [Frequently Asked Questions (FAQ)](#frequently-asked-questions-faq)

-----

## **Core Concepts: What Makes Stipula Different?**

Stipula isn't a general-purpose programming language. Instead, it's built on a few powerful abstractions that directly map to concepts familiar in the legal world.

### **1. State-Aware Programming (Permissions and Prohibitions)**

A legal contract's rules change as parties take action. What you're allowed to do depends on the current "state" of the agreement.

  * **How it works:** Stipula uses a **state machine** model. You define different states (like `@Inactive`, `@Payment`, `@Active`), and each function can only be called when the contract is in a specific state.
  * **Legal Meaning:** This directly models **permissions** (a function is available in the current state) and **prohibitions** (a function is not available). For example, a `complete_deal` function is only permitted after a `make_payment` function has been called.

#### Example: A Simple State Machine

This contract ensures that a deal can only be completed *after* it has started.

```stipula
[1] // Function to start the deal. It can only be called in the @Ready state.
[2] @Ready Payer: start_deal() {
[3]     // The function body is empty, but it changes the state.
[4] } => @InProgress
[5] 
[6] // Function to complete the deal. It can ONLY be called in the @InProgress state.
[7] @InProgress Receiver: complete_deal() {
[8]     // ...
[9] } => @Finished
```

### **2. Asset-Aware (Linear) Programming (Currency and Tokens)**

Legal contracts constantly deal with resources that can be transferred but not duplicated, like money or property titles.

  * **How it works:** Stipula has a special category for **assets**, which are treated as **linear resources**. This means they can't be accidentally copied or deleted; they must be explicitly moved. The `⊸` operator is used for asset movements to distinguish them from simple data updates (`→`).
  * **Legal Meaning:** This directly models the transfer of **currency, tokens, or digital representations of physical goods**. It prevents common errors like double-spending or assets getting permanently locked in the contract.

#### Example: Depositing an Asset

Here, a `Payer` deposits money into a secure `escrow` asset held by the contract.

```stipula
[1] // Declare the asset that will hold the funds.
[2] assets escrow
[3] 
[4] // This function can be called by the 'Payer' in the '@AwaitingPayment' state.
[5] // The '[payment]' part means this function ACCEPTS an asset.
[6] @AwaitingPayment Payer: deposit [payment] {
[7]     // The 'payment' asset is MOVED into the contract's 'escrow' asset.
[8]     // The Payer no longer owns 'payment' after this operation.
[9]     payment ⊸ escrow
[10] } => @PaymentHeld
```

### **3. The `event` Primitive (Obligations and Deadlines)**

Obligations are central to legal contracts—actions that *must* be performed, often by a certain deadline.

  * **How it works:** The `event` primitive schedules a future statement to be executed automatically at a specific time. If an obligation isn't met by the deadline, the event triggers a pre-defined penalty or next step.
  * **Legal Meaning:** This is the direct implementation of **obligations** and **commitments**. For example, an event can automatically transfer a security deposit to the lender if a rented item isn't returned on time.

#### Example: A Rental Deadline

This function starts a rental period and sets a timer. If the item isn't returned within 24 hours, a penalty is automatically applied.

```stipula
[1] // The 'rent_item' function schedules an event for 24 hours in the future.
[2] @ReadyToRent Borrower: rent_item() {
[3]     // The '>>' syntax defines an event.
[4]     // 'now + 24_hours' sets the deadline.
[5]     now + 24_hours >> @Rented {
[6]         // This code runs ONLY if the contract is still in the @Rented state
[7]         // after 24 hours. This means the item was not returned in time.
[8]         security_deposit ⊸ Lender // The deposit is transferred as a penalty.
[9]     } => @Expired
[10] } => @Rented
```

### **4. The `agreement` Primitive (Meeting of the Minds)**

A contract only becomes legally effective when all parties consent to its terms.

  * **How it works:** The `agreement` is the contract's "constructor". It's a special block at the beginning that defines the parties involved and the initial parameters they must agree upon before the contract can start.
  * **Legal Meaning:** This represents the "meeting of the minds," the moment the contract is formed and becomes legally binding. It can also be used to formally include a trusted third party, like an **Authority**, to oversee the contract and resolve disputes.

#### Example: Agreeing on Price

This simple agreement ensures a Buyer and Seller agree on the `price` before any transaction can occur.

```stipula
[1] // First, declare the parties and the field they will agree on.
[2] fields price
[3] 
[4] // This block defines the agreement.
[5] agreement (Buyer, Seller) {
[6]     // The 'Seller' is responsible for SETTING the value of 'price'.
[7]     Seller SET=> price
[8]     // The 'Buyer' must agree to (OK) the value set by the Seller.
[9]     Buyer OK=> price
[10] } => @ReadyToPay // The contract starts in this state ONLY after both agree.
```

-----

## **Using the Stipula Workbench: A Practical Guide**

Let's build a simple "Bike Rental" contract step-by-step using the editor. The editor is split into two main panels: the **Editor Panel** on the left where you build the contract, and the **Output Panel** on the right where you see the generated code and analysis results.

### **Step 1: Set Up Your Project**

Before writing clauses, you need to define the contract's fundamental components.

1.  **Name Your Contract:** In the `Name` card at the top, enter "Bike\_Rental".
2.  **Define Parties:** In the `Parties` card, type "Lender" and press Add. Then, type "Borrower" and press Add. These are the actors who can interact with your contract.
3.  **Declare Fields:** Fields are like variables that store data. In the `Fields` card, add `cost` and `renting_time`.
4.  **Declare Assets:** Assets are special variables for resources like money or tokens. In the `Assets` card, add `wallet`. This will hold the payment in escrow.

### **Step 2: Craft the Agreement**

Now, let's define the initial agreement that kicks off the contract.

1.  Go to the `Agreement` card. An empty agreement clause is already there.
2.  **Fields to be Agreed:** In the "Fields to be agreed" list box, use the dropdown to select `cost` and then `renting_time`.
3.  **Parties that Agree:** In the "Parties that agree" list box, use the dropdown to select `Lender` and `Borrower`.
4.  **Initial State:** In the input box at the bottom of the card, name the state after the agreement: `@Inactive`.

This sets up the rule that the contract starts in the `@Inactive` state once the Lender and Borrower have agreed on the `cost` and `renting_time`.

### **Step 3: Write the Clauses (Functions)**

Functions are the executable clauses of your contract. We'll add them one by one using the Function Editor modal.

1.  **Open the Editor:** Go to the `Functions` card and click the **New Function** button. The Function Editor modal will appear, overlaying the screen.

2.  **Create the `offer` Function:**

      * **Name:** `offer`
      * **From state:** In this list box, add the `@Inactive` state. This means `offer` can only be called when the contract is inactive.
      * **Who can call it?:** In this list box, use the dropdown to select `Lender`.
      * **To state:** In the input field at the bottom, type `@Payment`. This is the state the contract will move to after this function runs.

3.  **Create the `pay` Function:**

      * Click **Add Function** in the modal to save your `offer` function. The modal will close.
      * Click **New Function** again to open a fresh modal.
      * **Name:** `pay`
      * **From state:** Add the `@Payment` state.
      * **Who can call it?:** Select `Borrower`.
      * **Actions:** This is where you define what the function does. Click the **`+` icon**. A dropdown menu will appear. Select **"Send x to y"**. This will create an action row. Fill it in to represent the payment being moved into the contract's `wallet`.
      * **To state:** Set this to `@Using`.

4.  **Save and Continue:** Click **Add Function** to save. You can continue this process, adding more functions like `end_rental`. As you add functions, they will appear in a list in the `Functions` card. You can click **Edit** or the delete icon next to any function to modify or remove it.

### **Step 4: Analyze Your Contract**

As you build your contract, the generated code appears in the **Output Panel** on the right. Once you have a few clauses, you can check your work.

1.  **View the Code:** Look at the code block in the Output Panel. You'll see the `stipula Bike_Rental {...}` contract taking shape based on your inputs.
2.  **Run the Analyzer:** Click the **Analyze Code** button. The workbench will perform liquidity and reachability analysis.
3.  **Check the Results:** An analysis box will appear below the code. It will tell you if it found any potential issues, such as clauses that can never be executed or scenarios where assets might get stuck.

That's it\! You've successfully created and analyzed your first legal contract with Stipula.

-----

## **Common Legal Patterns in Stipula**

Stipula's core features can be combined to model common, real-world legal scenarios. Here are a couple of powerful patterns.

### **Handling Escrow and Disputes with an Authority**

Many contracts require a neutral third party to hold funds (escrow) and resolve disputes if something goes wrong.

  * **The Pattern:** You include an `Authority` party in the initial `agreement`. This `Authority` is given exclusive permission to call special functions that can resolve a dispute, for example, by distributing escrowed funds based on their verdict.
  * **How it Works:** The contract enters a `@Dispute` state. In this state, only the `Authority` can act, preventing the other parties from interfering. The `Authority`'s function (`verdict` in the example) then moves the assets from the `escrow` to the appropriate parties.

#### Example: A Simple Dispute Resolution

```stipula
[1]  assets escrow
[2]
[3]  // The Authority is included from the start.
[4]  agreement (Seller, Buyer, Authority) { ... } => @Active
[5]
[6]  // A party can initiate a dispute, moving the contract to a special state.
[7]  @Active Buyer: raise_dispute() {
[8]      // ...
[9]  } => @Dispute
[10]
[11] // In the @Dispute state, ONLY the Authority can act.
[12] @Dispute Authority: verdict(winner) {
[13]     if (winner == Seller) {
[14]         escrow ⊸ Seller  // The escrow is sent to the Seller.
[15]     } else {
[16]         escrow ⊸ Buyer   // The escrow is returned to the Buyer.
[17]     }
[18] } => @Closed
```

### **Handling External Events with a Data Provider**

Some contracts depend on real-world information that exists outside the contract, like the winner of a match or the price of a stock. This is often called an "oracle" problem.

  * **The Pattern:** You include a `DataProvider` party in the `agreement`. This party is a mutually-agreed-upon source of truth. Their sole purpose is to call a specific function to inject the external data into the contract, which then determines the outcome.
  * **How it works:** The contract waits in a state like `@AwaitingResult`. Once the `DataProvider` calls the `report_outcome` function, the contract uses the provided data to distribute assets and then moves to a final state. Time-limited `event`s are often used as a fallback in case the provider fails to deliver the data.

#### Example: A Simple Bet

```stipula
[1]  assets bet1, bet2
[2]
[3]  // The DataProvider is the agreed-upon source of the result.
[4]  agreement (Better1, Better2, DataProvider) { ... } => @AwaitingResult
[5]
[6]  // Only the DataProvider can call this function.
[7]  @AwaitingResult DataProvider: report_outcome(winner) {
[8]      if (winner == Better1) {
[9]          bet1 ⊸ Better1
[10]         bet2 ⊸ Better1
[11]     } else {
[12]         bet1 ⊸ Better2
[13]         bet2 ⊸ Better2
[14]     }
[15] } => @Finished
```

-----

## **Static Analysis Tools: Ensuring Your Contract is Safe**

Your workbench comes with powerful tools to analyze your contracts *before* you deploy them. This helps catch bugs and prevent costly errors.

### **1. Type Inference**

Even though Stipula's syntax is untyped to keep it simple, the workbench includes a **type inference system**.

  * **What it does**: It automatically determines the types (e.g., `real`, `bool`, `asset`) of your fields and parameters based on how they are used.
  * **Why it's useful**: It helps prevent basic errors, thus preventing basic errors with contract's data and assets.

### **2. Liquidity Analysis**

A critical flaw in any smart contract is having funds or other resources get stuck forever. This is known as a **liquidity** problem.

  * **What it is**: A contract is **liquid** if no asset remains frozen inside it indefinitely. In other words, every asset that enters the contract has a path to eventually be redeemed by a party.
  * **How it works**: The analyzer uses a technique called **symbolic analysis** to track the input-output behavior of functions on assets. It checks all possible computations to see if any scenario leads to a non-empty asset at the end with no way to empty it.
  * **Why it's useful**: It provides a strong guarantee that your contract won't accidentally lock up user funds, which is a major security concern.

-----

## **Fragments of Stipula: Understanding Decidability**

While Stipula is powerful, certain combinations of its features can make it impossible for a computer to *always* predict every possible outcome. This is a concept known as **undecidability**. Researchers have studied several important fragments of Stipula to understand these limits.

  * **µStipula\<sup\>I\</sup\> (Instantaneous)**: A version where all events are immediate (`now + 0`). Even in this simplified form, determining if a clause is reachable is **undecidable**.
  * **µStipula\<sup\>TA\</sup\> (Time-Ahead)**: A version where all events are in the future (`now + k` where `k > 0`). This is also **undecidable**.
  * **µStipula\<sup\>D\</sup\> (Determinate)**: A version where functions and events cannot be triggered from the same states. This is also **undecidable**.
  * **µStipula\<sup\>DI\</sup\> (Determinate-Instantaneous)**: The good news\! When you combine the determinate and instantaneous fragments, clause reachability becomes **decidable**. This means the analyzer can give you a complete and guaranteed answer about whether a clause can ever be reached.

Knowing these limitations helps you design contracts that are easier to formally verify. Sticking to the patterns of the **µStipula\<sup\>DI\</sup\>** fragment is a good practice for critical contracts.

-----

## **Frequently Asked Questions (FAQ)**

  * **What happens if a precondition in a function is false?**
    If a function is called but its precondition (the part in `(...)`) evaluates to false, the function's body will not execute, and the contract will not change its state. It's as if the call was never allowed.

  * **Can assets have negative values?**
    No. The semantics of Stipula ensure that asset operations can at most drain an asset to zero, but never make it negative. This prevents a whole class of errors.

  * **What's the difference between `→` and `⊸`?**
    The `→` (arrow) is for updating regular data fields. The old value is simply replaced. The `⊸` (lollipop) is exclusively for moving assets. It ensures the asset's value is conserved—it is subtracted from the source and added to the destination, never copied or destroyed.

  * **Can an event be cancelled?**
    In the core language, once an event is scheduled, it cannot be cancelled directly. However, you can design your contract's state machine to make an event's trigger condition impossible. For example, if an event is scheduled to run in the `@Rented` state, moving the contract to an `@ItemReturned` state before the deadline will effectively disable the event, because its state condition will no longer be met.

