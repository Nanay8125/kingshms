# Investigation: dbService.getById Missing Fallback

## Bug Summary
The `getById` method in `services/dbService.ts` does not have a fallback to local data when the API fetch fails. Other methods like `getAll`, `create`, `update`, and `delete` all have fallbacks to `LocalStorage` (or demo data) to ensure the app works even if the back-end API is not responding.

## Root Cause Analysis
In `services/dbService.ts:107-110`, the `catch` block for `getById` simply logs the error and returns `undefined`.

```typescript
107→        } catch (error) {
108→            console.error('Fetch error:', error);
109→            return undefined;
110→        }
```

This prevents the app from retrieving individual items from local storage when the server is down.

## Affected Components
- `services/dbService.ts`
- Any component that relies on `dbService.getById` when the API is unavailable.

## Proposed Solution
Update the `catch` block in `getById` to call `this.getLocalData(table)` and find the item by ID in the returned array.

```typescript
        } catch (error) {
            console.error('Fetch error:', error);
            const localData = this.getLocalData(table);
            return localData.find((item: any) => item.id === id);
        }
```
