

# Remove Currency Symbols from Sabeel Management

## What Changes

Remove all `₹` currency symbols and Indian locale formatting (`toLocaleString('en-IN')`) from the dues/Sabeel components. Amounts will display as plain numbers since currency management is not yet implemented.

## Files to Update

### 1. `src/components/dues/SabeelFormSheet.tsx`
- Remove the `₹` prefix span from the monthly amount input
- Remove `pl-7` padding class (no longer needed without prefix)

### 2. `src/components/dues/FMBHubForm.tsx`
- Remove the `₹` prefix span from the monthly amount input
- Remove `pl-7` padding class

### 3. `src/components/dues/KhumusForm.tsx`
- Remove `₹` prefix spans from fixed amount and monthly income inputs
- Remove `pl-7` padding classes
- Change calculated amount display from `₹{amount.toLocaleString('en-IN')}` to just `{calculatedAmount}`

### 4. `src/components/dues/ZakatForm.tsx`
- Remove `₹` prefix spans from fixed amount, assets value, and nisab threshold inputs
- Remove `pl-7` padding classes
- Change calculated zakat display from `₹{amount.toLocaleString('en-IN')}` to plain number

### 5. `src/components/dues/SabeelCard.tsx`
- Remove `₹` from all display values: monthly amounts, khumus calculations, zakat calculations
- Replace `.toLocaleString('en-IN')` / `formatAmount()` calls with plain number display

### 6. `src/components/dues/DueRemindersCard.tsx`
- Remove `₹` from the reminder amount display

