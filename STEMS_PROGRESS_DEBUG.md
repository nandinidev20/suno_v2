# Stems Progress Tracking - Debug Guide

## Issues Fixed

### 1. **Re-render Subscription Issue** ✅
**Problem**: Library and Modal components weren't re-rendering when jobs state updated in context.
**Solution**: Changed from using `getJobStatus()` callback to directly using the `jobs` object from context.
- This makes React automatically re-render when the `jobs` state changes.
- Both Library.jsx and StemsModal.jsx now subscribe to `jobs` directly.

### 2. **Socket Connection Logging** ✅
**Problem**: Unclear if socket was connected and receiving events.
**Solution**: Added detailed console logging:
- Socket connection status logged
- Each `stems_progress` event logged with jobId, progress %, status
- Job creation/update logged
- Socket room join operations logged

### 3. **Socket Room Rejoining** ✅
**Problem**: When socket reconnected, incomplete jobs weren't rejoining rooms.
**Solution**: Added useEffect hook that automatically rejoins rooms when:
- Socket reconnects
- New jobs are added
- Socket connection state changes

---

## How to Debug Progress Issues

### Step 1: Open Browser Console
Open Developer Tools (F12) → Console tab

### Step 2: Look for These Logs

```
StemsContext: Extraction started: {jobId, externalJobId, ...}
StemsContext: Adding job to context: {jobId, trackId, ...}
StemsContext: Joined room for jobId: xxx
StemsContext: stems_progress received - jobId: xxx progress: 45 status: processing
StemsContext: Updating job xxx to progress: 45
```

### Step 3: Common Issues

**Issue: Logs show "Adding job" but no progress updates**
- Socket might not be connected
- Look for: `StemsContext: Socket connected` message
- Check if `stems_progress` events are being received

**Issue: Progress shows 0% forever**
- Socket is connected but not receiving progress events
- Verify backend is sending `stems_progress` events
- Check backend socket URL: Should match frontend SOCKET_URL

**Issue: Progress updates very slowly**
- Check Network tab → WebSocket message frequency
- Should receive updates every 2-5 seconds typically
- If not, backend might have issues

**Issue: Progress shows but modal doesn't update**
- Modal wasn't properly subscribed (now fixed)
- Should see progress update in modal in real-time

---

## What Should Happen (Flow)

1. **User clicks "Extract Stems"**
   ```
   Console: StemsContext: Extraction started
   Console: StemsContext: Adding job to context
   Console: StemsContext: Joined room for jobId: xxx
   ```

2. **Backend starts processing**
   ```
   Console: StemsContext: stems_progress received - jobId: xxx progress: 10
   Console: StemsContext: Updating job xxx to progress: 10
   (UI updates - modal and dropdown show "10%")
   ```

3. **Progress continues**
   ```
   Console: StemsContext: stems_progress received - jobId: xxx progress: 25
   Console: StemsContext: stems_progress received - jobId: xxx progress: 50
   Console: StemsContext: stems_progress received - jobId: xxx progress: 75
   (UI keeps updating with new percentages)
   ```

4. **Extraction completes**
   ```
   Console: StemsContext: stems_ready received
   Console: StemsContext: Auto-download triggered for jobId: xxx
   (UI shows success, file downloads, job removed from dropdown)
   ```

---

## Key Code Changes

### StemsContext.jsx
- Improved `stems_progress` handler with better job matching
- Added socket connection logging
- Added useEffect to rejoin rooms on socket reconnect
- Better error handling and logging

### Library.jsx
- Changed from `getJobStatus()` to `jobs` object subscription
- Modal and dropdown now properly track job progress

### StemsModal.jsx
- Changed from `getJobStatus()` to `jobs` object subscription
- Modal progress updates in real-time

---

## Performance Tips

- Progress updates are batched by React (multiple state updates = 1 re-render)
- Socket events arrive every 2-5 seconds from backend
- UI updates should be visible within 100-500ms of event
- If slower, check browser performance (DevTools → Performance tab)

---

## Socket Troubleshooting

If you see `StemsContext: Socket connect_error`:

1. Check backend server is running and accessible
2. Verify SOCKET_URL is correct (currently: `https://api.openbeat.ai`)
3. Check firewall/CORS settings
4. Look at Network tab → WebSocket connection
5. Check browser console for detailed error messages
