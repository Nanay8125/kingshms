# Bug Investigation - KingsHMS

## Bug Summary
Several issues identified during investigation:
1.  **ReferenceError: navigator is not defined**: Occurs when `authService.login` or `dbService.addAuditLog` is called in a Node.js environment (e.g., during tests). This is because `navigator.userAgent` is accessed without checking if `navigator` exists.
2.  **Stale Demo Data**: All bookings in `constants.tsx` have dates in 2024, but the current year is 2026. This causes the UI to show guests who should have checked out years ago as still "checked-in".
3.  **Inconsistent Key Prefixes**: Manual seed data in `constants.tsx` uses prefixes like `hk`, `mt`, `fd` for access keys, while the generation logic in `App.tsx` uses the first two letters of the department (`ho`, `ma`, `fr`).

## Root Cause Analysis
1.  **navigator issue**: Lack of environment check before accessing browser-only APIs.
2.  **Stale data**: Hardcoded dates in `constants.tsx` that haven't been updated to reflect the current time.
3.  **Inconsistent prefixes**: Divergence between initial design (manual) and implementation (automatic).

## Affected Components
- [./services/authService.ts](./services/authService.ts)
- [./services/dbService.ts](./services/dbService.ts)
- [./constants.tsx](./constants.tsx)
- [./App.tsx](./App.tsx)

## Proposed Solution
1.  **Fix navigator issue**: Add a check for `typeof navigator !== 'undefined'` before accessing `navigator.userAgent`. Fallback to 'Server/Node.js' or similar.
2.  **Update demo data**: Shift dates in `constants.tsx` to be closer to the current date (2026).
3.  **Standardize key prefixes**: Update the generation logic in `App.tsx` or the seed data in `constants.tsx` to match. Standardizing on `hk`, `mt`, `fd` (manual style) seems better as they are more recognizable.

## Confirmation Needed
Should I proceed with fixing these issues? I'll start with the `navigator` fix as it's the most critical for testing.
