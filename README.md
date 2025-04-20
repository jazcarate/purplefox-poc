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

## Gripes
PurpleFox is an amazing tool. But I have a few ~~issues~~ opportunities of improvement. 
I believe running code is a good tool for communication, but I will use this space to add some context to my reasoning.

### Local first
When slow internet, clicking a table number does _nothing_ until the event is proceed. And there is no indication that something is happening. This is both frustrating, and leads to:

1. I want to go from Unknown -> Done: Tap. **Wait**. Tap. **Wait**. Tap.
1. I want to go from Unknown -> Playing: Tap. _Nothing happens_ so I tap again. The table now is in covered.

**Suggestion**: Update the UI instantly and add a "loading" indicator.

### EoR Lead signals
When I'm assigning people to go check table status, or cover a table, I have no indication when those things are done; other than looking closely to my phone. But I can't because I'm also assigning people to do the same job in different areas.

**Suggestion**: Add a subtle pulsating effect when an update comes via the Websocket. You would be surprised how well the human brain performs to periphery signals

### Out of sync
Websocket connection is often unreliable in venues. And the PurpleFox user has no indication if what they are seeing is synced or not. This leads to systematic refresh; often when it is not needed.
There is also no resync mechanism when Websockets gets back online. Therefore updates can be missed.

**Suggestion**: A badge of "connected".
Bonus: Show how long since the last update; let the human decide.
Caveat: Supabase's realtime has a 30s heartbeat. This is not good enough. 

### Locking (or lack thereof)
Sometimes the same table is updated from different devices. The current way to handle it is to override the last insert; but that might not always be the most up to date (a slower connection can start earlier, but arrive later). 

**Suggestion**: Implement a "optimistic locking" on tables to manage concurrent updates. 

```SQL
UPDATE table_status 
SET status = {{next}}
WHERE tableNumber = 40
  AND status = {{previous}}
```
Trying to recreate a [Compare-and-swap](https://en.wikipedia.org/wiki/Compare-and-swap) technique.

When the update fails, it might be because someone else already did the same update. In this case, ignore the fail. Otherwise, rollback the update and one of the parties will see a table with a error.


### Double-Tap zoom
It is annoying when I'm double tapping, my phone tries to zoom in.

**Suggestion**: Disable the feature via CSS
```css
.tournament {
    touch-action: manipulation;
}
```