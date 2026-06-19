# Booking Time Selection Optimization Design

## Purpose
Optimize the loading experience of the time selection step (Step 3) in the booking flow. Currently, navigating back and forth to Step 3 triggers a blocking loading state even if the selected date and party size haven't changed.

## Requirements
- Eager load time slot availability as soon as a valid date and party size are selected (even if the user is still on Step 2).
- Cache the fetched data and record the timestamp of the successful fetch.
- When the user transitions to Step 3, reuse the cached data to prevent UI blocking.
- If the cached data is older than 2 minutes when the user transitions to or views Step 3, proactively refresh the data.
- Ensure that changing the date or party size instantly invalidates the cache and triggers a new fetch.

## Architecture & Data Flow

1. **State Management**:
   We will introduce a `useRef` to store the cache context without triggering unnecessary re-renders.
   ```typescript
   type SlotCache = {
     date: string;
     partySize: number;
     data: SlotAvailability[];
     fetchedAt: number;
   }
   const slotCache = useRef<SlotCache | null>(null);
   ```

2. **Fetching Logic**:
   The `useEffect` responsible for fetching slots will be decoupled from the `step` variable. It will trigger whenever `date` or `partySize` changes (provided they are valid).
   
   ```typescript
   useEffect(() => {
     if (!date || !isStep1Valid) return;
     const dateStr = toISO(date);
     const size = Number(partySize);
     
     // Check if we have valid cache < 2 mins old
     const now = Date.now();
     const cache = slotCache.current;
     if (cache && cache.date === dateStr && cache.partySize === size) {
       if (now - cache.fetchedAt < 2 * 60 * 1000) {
         // Valid cache, no need to fetch
         setSlotAvailability(cache.data);
         return;
       }
     }
     
     // Otherwise fetch
     // ...
     getPublicSlotAvailability(dateStr, size).then(result => {
        if (result.ok) {
           slotCache.current = { date: dateStr, partySize: size, data: result.data, fetchedAt: Date.now() };
           setSlotAvailability(result.data);
        }
     });
   }, [date, isStep1Valid, partySize]); // Removed `step` dependency
   ```

3. **Step 3 Transition Revalidation**:
   To handle the case where the user stays on Step 2 for 5 minutes and then clicks Next to Step 3, we will add an additional lightweight check when `step` changes to 3.
   
   ```typescript
   useEffect(() => {
     if (step === 3 && date && isStep1Valid) {
       const cache = slotCache.current;
       if (cache && (Date.now() - cache.fetchedAt >= 2 * 60 * 1000)) {
         // Stale! Refresh silently or with loading state
         // We will refresh with loading state to prevent booking unavailable slots
         fetchSlots(); 
       }
     }
   }, [step, date, isStep1Valid]);
   ```

## Trade-offs
- The eager loading mechanism will make an API call every time the user clicks a different date in the calendar. If the user clicks 5 dates rapidly, it will trigger 5 API calls. We could add a simple debounce, but since `react-day-picker` selection is discrete, the current approach is acceptable unless performance issues arise.

## Open Questions / Ambiguities
- If the cache expires (2 minutes pass) *while* the user is actively sitting on Step 3, do we auto-refresh, or only refresh when they navigate to the step?
  **Decision:** We only check when navigating to Step 3 or when `date`/`partySize` changes. This avoids sudden layout shifts while the user is actively trying to click a time.

## Verification
- Test selecting Date A, wait < 2 minutes, go to Step 3 -> Should not show loader.
- Test selecting Date A, go back to Step 2, wait 2 minutes, go to Step 3 -> Should show loader and refresh.
- Test selecting Date A, then changing to Date B -> Should fetch immediately.
