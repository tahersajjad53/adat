

# Hide Sabeel / Dues Functionality (Temporary)

Two small changes to hide the dues feature until it's ready for launch:

## Changes

### 1. Profile Page (`src/pages/Profile.tsx`)
- Remove the "Sabeel" menu button from the main profile menu
- Remove the `sabeel` section rendering block (the `if (activeSection === 'sabeel')` branch)
- Remove the unused `DuesSection` import

### 2. Dashboard (`src/pages/Dashboard.tsx`)
- Remove the `<DueRemindersCard />` component from the Today feed
- Remove the unused `DueRemindersCard` import

No data or database changes -- the underlying hooks and components remain in the codebase for reactivation later.

