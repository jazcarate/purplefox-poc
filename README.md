# PurpleFox POC

A proof of concept for a tournament management application with an interactive number grid.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Improvement Opportunities
PurpleFox is an amazing tool. However, I have identified several opportunities for improvement. 
I believe running code is a good tool for communication, so I've implemented these improvements in this POC while providing context for my reasoning below.

In order of importance:

### Local-First Approach
When experiencing slow internet, clicking a table number does _nothing_ until the event is processed by the server. There is no indication that something is happening. This creates frustration:

1. If I want to cycle two states, I need to tap, *wait*, tap again.
2. Tapping multiple times is unreliable. It depends on my connection strength what the final state is.

**Implemented Solution**: The UI updates instantly with optimistic updates and displays a loading indicator while the server request is in progress. If the update fails, the UI reverts to the confirmed state with an error indicator.

### Concurrent Update Handling
Sometimes the same table is updated from different devices simultaneously. The current approach simply overrides with the last update received, but this isn't always correct because a slower connection might have started its update earlier but arrive later.

**Implemented Solution**: Applied optimistic locking on table updates to manage concurrent modifications correctly.

```SQL
UPDATE table_status 
SET status = {{next}}
WHERE tableNumber = 40
  AND status = {{previous}}
```

This implementation recreates a [Compare-and-swap](https://en.wikipedia.org/wiki/Compare-and-swap) technique to ensure data consistency.

When an update fails, the system checks if someone else has already made the desired change. If so, it accepts the existing state. Otherwise, it shows an error and reverts the UI, allowing the user to try again with the current state information.

### Synchronization Status Visibility
Websocket connections are often unreliable in tournament venues. Users have no indication if what they're seeing is synchronized with the server or not. This leads to unnecessary manual refreshes.

**Implemented Solution**: Added a status badge showing:
- Connection status (connected/disconnected)
- Time since the last update in a human-readable format

Note: There's no mechanism to recover missed updates when websockets reconnect after being temporarily offline.

### Visual Update Notifications
When running End of Round, assigning to check table status or cover tables, it's difficult to monitor when these actions are completed while simultaneously managing multiple tasks.

**Implemented Solution**: Added a subtle pulsating effect when an update comes via the websocket. This leverages the human brain's sensitivity to peripheral visual signals, allowing tournament directors to notice changes without having to actively monitor each table.

### Touch Interface Improvements
Double-tapping on mobile devices often triggers unwanted zoom actions, interfering with the intended table status updates.

**Implemented Solution**: Disabled this behavior with appropriate CSS:
```css
.tournament {
    touch-action: manipulation;
}
```

This prevents the browser's default double-tap zoom while maintaining other touch gestures.
