---
status: passed
phase: 08-expense-allocation
source: [08-01-SUMMARY.md, 08-02-SUMMARY.md, 08-03-SUMMARY.md, 08-04-SUMMARY.md, 08-05-SUMMARY.md]
started: 2026-04-15T00:00:00.000Z
updated: 2026-04-15T18:30:00.000Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 7
name: Export Expense Allocation Report

## Tests

### 1. Create an Expense with Income Source
expected: |
  Go to Payments → Add Payment → Select "Expense" type. 
  An "Income Source" dropdown appears with options: Sublet, Autoren Sell, Autoren Rent, Unallocated.
  Select a category (e.g., "property_maintenance"). The form suggests an income source based on category.
  User can keep the suggestion or select a different one.
result: passed

### 2. Filter Expenses by Income Source
expected: |
  Go to Payments list. Select "Expense" type filter.
  A new "Income Source" dropdown appears.
  Select "Sublet" - only expenses tagged to Sublet appear.
  Select "All Income Sources" - all expenses appear.
result: passed

### 3. View Income Source Badges on Payment List
expected: |
  In the Payments table, each expense row shows a colored badge indicating its income source.
  Sublet = blue, Autoren Sell = green, Autoren Rent = purple, Unallocated = gray.
result: passed

### 4. View Expense Allocation Report
expected: |
  Navigate to Reports → Expense Allocation (or similar).
  See summary cards showing total expenses per income source.
  See breakdown table with count and percentage.
  See bar chart visualization.
result: passed

### 5. View Expense Allocation in Business Summary
expected: |
  Navigate to Reports → Business Summary.
  See "Expense Allocation" section with PieChart showing breakdown by income source.
  If there are unallocated expenses, see an alert prompting to tag them.
result: passed

### 6. Export Expenses with Income Source
expected: |
  Go to Export → Select "Expenses" format.
  Download opens with columns: Date, Description, Category, Amount, Status, Income Source.
  Each row shows the income source it was allocated to.
result: passed

### 7. Export Expense Allocation Report
expected: |
  Go to Export → Select "Expense Allocation" format.
  Download opens with two sheets:
  - "By Income Source": shows totals per income source with count and percentage
  - "All Expenses": detailed list with income source column
result: passed

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
