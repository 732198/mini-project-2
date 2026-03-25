# PROPOSAL.md
## Mini Project #2 - Interactive Web Tool

---

**What I'm building:**
A personal finance dashboard that lets users log expenses, set category budgets,
and see a live breakdown of their spending versus what they planned.

---

**Who it's for / Why:**
Built for college students and young professionals who want a lightweight,
no-login way to track where their money is going month to month without
opening a spreadsheet or paying for an app like Mint or YNAB.

---

**Core features:**
1. Log an expense with an amount, category, and optional note
2. Set a monthly budget limit per category (Food, Transport, Housing, etc.)
3. See a live summary showing total spent, total budgeted, and remaining
4. Delete individual expense entries
5. Reset / clear all data for a fresh month

---

**What I don't know yet:**
- How to persist data with localStorage so entries survive a page refresh
- How to dynamically update multiple parts of the DOM at once when a new
  expense is added (summary totals, category breakdown, and the expense list)
- How to handle edge cases like empty input, negative numbers, or a category
  with no budget set
- How to structure state cleanly so all the data lives in one place and the
  UI just reflects it