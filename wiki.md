# **Welcome to the Stipula Wiki\!** 🏛️

This wiki is your starting point for creating formal, secure, and automated legal contracts using the **Stipula** language. Whether you're a lawyer, a developer, or just curious, you'll find everything you need to get started.

Stipula is a **domain-specific language** designed to bridge the gap between complex legal agreements and the computational world of smart contracts. Its goal is to make digital contracts more transparent, accessible, and verifiable.

-----

## **Core Concepts: What Makes Stipula Different?**

Stipula isn't a general-purpose programming language. Instead, it's built on a few powerful abstractions that directly map to concepts familiar in the legal world.

### **1. State-Aware Programming (Permissions and Prohibitions)**

A legal contract's rules change as parties take action. What you're allowed to do depends on the current "state" of the agreement.

  * **How it works:** Stipula uses a **state machine** model. You define different states (like `@Inactive`, `@Payment`, `@Using`), and each function can only be called when the contract is in a specific state.
  * **Legal Meaning:** This directly models **permissions** (a function is available in the current state) and **prohibitions** (a function is not available). For example, a `pay` function is only permitted after an `offer` has been made.

### **2. Asset-Aware (Linear) Programming (Currency and Tokens)**

Legal contracts constantly deal with resources that can be transferred but not duplicated, like money or property titles.

  * **How it works:** Stipula has a special category for **assets**, which are treated as **linear resources**. This means they can't be accidentally copied or deleted; they must be explicitly moved. The `⊸` operator is used for asset movements to distinguish them from simple data updates (`→`).
  * **Legal Meaning:** This directly models the transfer of **currency, tokens, or digital representations of physical goods**. It prevents common errors like double-spending or assets getting permanently locked in the contract.

### **3. The `event` Primitive (Obligations and Deadlines)**

Obligations are central to legal contracts—actions that *must* be performed, often by a certain deadline.

  * **How it works:** The `event` primitive schedules a future statement to be executed automatically at a specific time. If an obligation isn't met by the deadline, the event triggers a pre-defined penalty or next step.
  * **Legal Meaning:** This is the direct implementation of **obligations** and **commitments**. For example, an event can automatically transfer a security deposit to the lender if a rented item isn't returned on time.

### **4. The `agreement` Primitive (Meeting of the Minds)**

A contract only becomes legally effective when all parties consent to its terms.

  * **How it works:** The `agreement` is the contract's "constructor." It's a special block at the beginning that defines the parties involved and the initial parameters they must agree upon before the contract can start.
  * **Legal Meaning:** This represents the "meeting of the minds," the moment the contract is formed and becomes legally binding. It can also be used to formally include a trusted third party, like an **Authority**, to oversee the contract and resolve disputes.

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

