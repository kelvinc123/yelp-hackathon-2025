# Yes or Next

> “No overwhelmeness in list – AI gives you just **one great place at a time**: yes or next?”

Yes or Next is a conversational foodie friend that **never shows a giant list**.  
You tell it what you’re in the mood for, it shows **one** high-confidence restaurant at a time and asks: **“Yes or next?”**  
Powered by Yelp’s AI API, it learns from your swipes, wishlist, and (optionally) your friends’ tastes, then helps you **book** when you hit **Yes**.

---

## Problem

Everyone “searches for restaurants,” but the real pain is **deciding**:

> “I open Yelp, see 40 options, scroll for 20 minutes, and still don’t decide.”

Current apps are built around **lists & filters**, not around **making a decision**.  
Yes or Next is designed as a **decision-first** experience: no lists, just one strong suggestion at a time.

---

## Core Flows

### 1. Solo: One-at-a-time recommendations

- User types something fuzzy like:
  > “We want something casual within 2 miles for 3 people at 7 pm, not too expensive.”
- App calls Yelp AI and returns **one** rich restaurant card:
  - Photo, name, rating, price, distance
  - Short “Why this place for you tonight?”
- User taps:
  - **Yes** → move into booking / “lock it in” mode  
  - **Next** → give a reason (too far / too pricey / not our vibe), get a better-aligned card

### 2. Wishlist Mode (nice-to-have)

- User can star places into a **wishlist**.
- Option: *“Tonight, pick from my wishlist only.”*
- AI re-ranks wishlist items based on tonight’s context (time, distance, group size).

### 3. Group Mode (stretch)

- One person creates a **group session** (short link or code).
- Friends join; everyone sees the **same card** and taps Yes/Next.
- AI converges on a **top pick** (or small Top 3) that balances the group’s feedback.

---

## Key Features (Hackathon MVP)

- **Conversational AI UI**
  - Natural language input; AI confirms constraints & sets the “session mood” (date night, casual, quick bite).
- **One-card-at-a-time recommendations**
  - Never a long list; always a single card with a clear “why this?”
- **Micro-preference learning**
  - Each **Next** refines the session: too far, too expensive, wrong vibe, etc.
- **Booking / Handoff**
  - On **Yes**, AI moves into “lock it in”:
    - Show reservation options via Yelp AI agentic actions, or
    - Clear CTA to complete via Yelp/Yelp link.
  - Confirmation stays in the chat as the “win state.”


## Tech Stack

**Frontend**

- **Next.js (React, App Router)**
- **MUI** for UI components & theming

Key UI pieces:

- Chat pane (user + AI messages)
- Single `RestaurantCard` (photo, metadata, Yes/Next buttons)
- Optional controls: wishlist toggle, group code entry

**Backend**

- Next.js API routes or small **Node.js / TypeScript** server
- Responsibilities:
  - Manage **sessions** (`sessionId`, conversation state)
  - Call **Yelp AI API** with:
    - User message
    - Location, constraints
    - Previous Yes/Next + reasons
    - Optional wishlist / group info
  - Normalize response into a single **RestaurantCard** for the frontend
  - Handle reservation / booking handoff

**Storage (for hackathon)**

- Simple option: **in-memory map** keyed by `sessionId`
- Slightly more real: hosted Postgres (Supabase/Neon/etc.) with:
  - `sessions` (id, created_at, prefs)
  - `suggestions` (session_id, yelp_business_id, status)
  - `wishlists` (user/token, yelp_business_id)
  - `group_sessions` (id, join_code, aggregated prefs)

<!-- ---

## Getting Started (Dev)

> Placeholder commands – adjust to your tooling.

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open in browser
http://localhost:3000 -->
