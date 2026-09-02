# IDEA_SCOPE.md

> This document is the control plane for the build. You wrote it; your coding agent reads it before every session. If a proposed change does not improve the active milestone's acceptance test or the rubric strategy, it goes in the parking lot.

## 0. scope status

| Field | Value |
|---|---|
| Event | GrowthX Build Week · Season 03 |
| Builder | you, solo, plus your coding agent (Codex or Claude Code) |
| Build starts | Sat 29 Aug 2026, 11:00 AM IST |
| Submission deadline | Sat 5 Sep 2026, 11:00 AM IST |
| Demo | Sat 5 Sep 2026, 3:00 PM IST |
| Current milestone | M1 |
| Live URL | |
| Public repo | |
| Last updated | Tue 1 Sep 2026, 9:05 PM IST |

### status language

- **Specified:** described here but not implemented.
- **Implemented:** code exists.
- **Working locally:** the golden path runs in the development environment.
- **Live:** the golden path runs at the Vercel URL, logged out, on a phone.
- **Verified:** acceptance tests have passed on the live URL.
- **Demo-ready:** reset, fallback, timing and the numbers screenshot have been rehearsed.

## 1. idea lock

| Decision | Locked answer |
|---|---|
| One-sentence product | Fanzo is a sports bar finder for Bangalore; V1 starts with F1 screenings where the user enters their area and gets one race-night pub invite plan plus two backups. |
| The one person | Tapesh, 26, Bellandur, watches F1 with friends. |
| The one moment | Before the next F1 main race, he wants to decide where the group should watch it. |
| Current workaround | Google searches, Instagram checks, event apps, asking friends, and calling usual pubs. |
| Core action (user does X -> gets Y) | User enters Bangalore area -> gets one best F1 race screening pub plus two backups. |
| The one outcome the product must deliver | User sends one clear WhatsApp invite or calls the pub to confirm. |
| Hard input or hard case | User enters vague locations like "near HSR" or "somewhere around Bellandur." |
| Primary track | Virality |
| Riskiest assumption | People trust the result enough to share/call instead of checking five apps. |
| The 30-minute no-code test for it | Call/check 5 F1 pubs and send the draft result to Dhruva, Tapish and Shruti; see if at least 2 would use/share it. |
| First three users (names, where they are) | Dhruva, Tapish, Shruti via WhatsApp. |
| Tuesday channel (where those users already gather) | GrowthX community. |
| Personal artifact a user would screenshot | WhatsApp-ready F1 watch invite with race, pub, evidence status and map link. |
| Saturday numbers I expect to report | Visitors, share/call actions, GrowthX post reactions, first-user feedback. |
| Library lineage (card or proven build, if any) | None. This is a brought idea. |

### why this idea

#### the pain I feel

Finding a sports screening in Bangalore is messier than it should be. A fan has to check Google, Instagram, event apps, friends and pub phone numbers just to know where the match is actually playing. This is personally testable because the first users can be messaged on WhatsApp and the first venue list can be verified manually.

#### decisive proof

A stranger opens the broad Fanzo landing page, clicks into the F1 finder at `/f1`, enters "Bellandur" or "near HSR", sees the next F1 main race, gets one best pub invite and two backups, then clicks Share invite or Call pub. A reviewer sees the same flow live and sees Convex counts for meaningful actions plus analytics for visitors.

## 2. user and job

### user

- Who (name, age, situation): Tapesh, 26, lives in Bellandur and watches F1 with friends.
- Context: He is trying to make a match-night plan before the next F1 main race.
- Frequency: Race weekends, especially main race nights.
- Existing behaviour: Google search, Instagram search, event apps, asking friends, calling usual pubs.
- Existing cost, delay, risk or frustration: Too many apps, uncertain pub screening status, late discovery that the venue is full, not screening, or has the wrong vibe.

### job to be done

> When `the next F1 main race is coming up`, they need to `pick one nearby pub plan they can send to friends`, so that `the group decides quickly and avoids last-minute venue confusion`.

### definition of completion

The job is complete only when:

1. The user receives one best F1 screening pub and two backups for Bangalore.
2. The best pub has a clear evidence tag: Verified, Posted about F1, Regular F1 venue, or Needs call.
3. The user can either share one WhatsApp-ready invite or call the pub.

Advice, a transcript, an extraction, search results or a chat response alone do not count unless they are themselves the final usable output.

## 3. product contract

### golden path

1. User opens the live URL and enters the V1 F1 finder at `/f1`.
2. Product shows the next F1 main race and asks for the user's Bangalore area.
3. User enters a free-text area such as "Bellandur" or "near HSR."
4. Product ranks all Bangalore F1 venues by evidence tag first and nearby location second.
5. Product shows one best race invite card plus two backup pubs.
6. User clicks Share invite if the best pub is Verified, or Call pub if it is not verified.
7. Product asks for email, records the meaningful action, then completes the share/call action.

### inputs

| Input | Format/source | Hard characteristics | Validation |
|---|---|---|---|
| User area | Free text | May be vague, misspelled, or nearby-area language | Must map to a supported Bangalore zone or show a friendly fallback |
| Venue data | Convex approved venue signals + code-file fallback | Must include evidence tag, source URL, area and review status | Only approved online signals can enter customer ranking |
| Next F1 race | Manual entry from official F1 calendar for V1 | Must be main race only, not qualifying or practice | Race name and date shown in UI |
| Email | User input after Share/Call click | Needed for meaningful action tracking | Basic email format check |

### outputs and state changes

| Output/state change | Consumer | Required format | Proof of completion |
|---|---|---|---|
| Best pub invite | End user and their friends | Race name/date, pub, area, evidence status, vibe, map link | Share invite text generated |
| Two backups | End user | Pub cards with reason and action | Visible on result screen |
| Meaningful action | Builder/reviewer | `share_plan_clicked` or `call_pub_clicked` | Convex count and screenshot |
| Visitor analytics | Builder/reviewer | Unique visitor count | Read-only analytics view |

### what the product must remember

- within one session: entered area, recommended pub, backup pubs, pending email modal.
- across sessions (Convex tables): venue data, search runs, emails, meaningful actions, timestamps.
- what it must deliberately forget: exact user location beyond the area text; no phone number in V1.

### human review boundary

- What can be automated: area matching, venue ranking, invite text generation, action tracking.
- What requires confirmation: whether a pub is Verified today.
- What must be escalated: missing phone number, broken map link, unclear screening status.
- How uncertainty is exposed: evidence tags and copy such as Needs call.

## 4. what makes it different

### the obvious version

A directory page listing pubs with filters for sport and area.

### the non-obvious choice

The product chooses one best pub and turns it into an invitation, because the real job is reducing group-chat debate, not browsing more options.

### the moment they screenshot

The personalized artifact is the F1 race invite: "Italian GP watch plan: [Pub], [Area], [status], [map]. Who's in?" If this does not get shared, reach will come from direct invites and the GrowthX community post.

### ideas deliberately rejected

| Rejected mechanic | Reason |
|---|---|
| Partner portal | Correct long-term, too much for this week |
| All sports | Makes data verification too wide |
| GPS nearby | Extra permission and mapping complexity |
| Group size | Does not change the recommendation in V1 |
| Qualifying/practice screenings | Most venues support main race watch parties only |
| Booking/payment | Not needed to prove the first behaviour |

## 5. dependencies

### verified capability matrix

| Required capability | Product/API/model | Exact endpoint/access | Limits | Verified how |
|---|---|---|---|---|
| F1 race schedule | Official Formula 1 calendar | `formula1.com/en/racing/2026` | Manual for V1 | Official calendar showed Italian GP race weekend 4-6 Sep 2026 |
| Venue data | Manual verification + public venue pages | Phone/Instagram/Maps | Quality depends on fresh checks | To be verified by calling/checking 5 pubs |
| Data storage | Convex | `convex/schema.ts`, `convex/actions.ts` | Requires `.env.local` with Convex deployment values | Convex project `sports-party` created and functions codegen passed |
| Venue signal search | Tavily Search API | `POST https://api.tavily.com/search` through server route `/api/venue-signals` | Free tier is 1,000 credits/month; V1 uses basic search | Official Tavily docs checked; local API key still needed |
| Hosting | Vercel | Project deployment | Not yet connected for sports-party | Must deploy empty app in M0 |
| Analytics | PostHog, Plausible, GA4 or Datafast | Read-only access required | Visitor row caps at L2 without it | Not set up yet |

### unsupported assumptions

Live partner updates, automated scraping, live Google Maps distance, ticket booking and payments must not enter the V1 critical path. Tavily search can support V1 only after a valid `TAVILY_API_KEY` is added.

### secrets and access

Convex and Vercel credentials live in their dashboards and environment variables. No secret values go in this document or the repo.
Tavily API key lives in `.env.local` for local development and Vercel environment variables for production. Never expose it to the browser.

## 6. rubric strategy

Pick **one primary track**: Virality, Revenue or AI Agent as a Service. You are scored on that track's rubric (version 2.2.0, in full in the rubric source). Every row is scored L1 to L5 independently; points per row = (L - 1) x weight. Wins in the other two tracks count as bonus at 0.5x weight, capped at 50 points, with the same evidence requirement. Shipping is the floor: a product that is not live scores nothing. Record a separate current level, target and proof for every row. The same piece of evidence does not raise two rows.

### primary track

| Decision | Answer |
|---|---|
| Primary track | Virality |
| Why this track fits the idea and my advantage | The output is a WhatsApp-ready plan people send to friends. First users are reachable through WhatsApp and the Tuesday post is in GrowthX community. |
| The one thing the track needs (a personal artifact people share / a named user who pays this week / a real task on a real surface unattended) | A personal artifact people share: the one-pub F1 watch invite. |

### the track's rows

**Virality (164 base + overflow)**

| Row | Weight | Max base | Current level | Target level | Target points (L-1)xweight | Observable proof | Work required | Milestone |
|---|---:|---:|---|---|---:|---|---|---|
| Impressions and views | 1x | 4 | L1: Under 500 | L2: 501 to 5k | 1 | GrowthX post views or screenshots | Post clear launch story | M3 |
| Reactions and comments | 2x | 8 | L1: Under 15 | L2: 15 to 50 | 2 | GrowthX post screenshot | Ask for F1 fans to test | M3-M4 |
| Amplification quality | 3x | 12 | L1: None | L2: 1-2 peer builders commenting or liking | 3 | Screenshot of peer engagement | DM peer builders after post | M3-M4 |
| Visitors to product | 10x | 40 | L1: Under 50 | L2: 51 to 250 | 10 | Read-only analytics access | Install analytics on Sunday | M1-M3 |
| Signups or meaningful actions | 25x | 100 | L1: Up to 25 | L2: 26 to 100 | 25 | Convex count of Share invite and Call pub actions | Track email-gated Share/Call clicks | M1-M4 |
| **Virality total** | | **164** | | | **41 target base points** | | | |

### bonus-eligible rows from the other tracks (0.5x, 50-point cap, same evidence)

| Source track | Row | Original weight | Bonus weight | Max bonus | Will I claim it? | Proof |
|---|---:|---:|---:|---:|---|---|
| Revenue | Signups | 20x | 10x | 40 | Maybe | Same Convex email + first-use action count, if it meets Revenue signup definition |
| Revenue | Live product quality | 8x | 4x | 16 | Maybe | Stranger completes core flow on phone without help |
| AI Agent as a Service | Real output shipping | 20x | 10x | 40 | No | Not an agent-as-service build |
| AI Agent as a Service | Observability | 7x | 3.5x | 14 | No | Not worth scope |

### level anchors (short form; the full ladders are in the rubric source)

- **Impressions and views** (organic + ads x 0.25): L2 501+ · L3 5k+ · L4 15k+ · L5 30k-50k, then +1 per 5,000.
- **Reactions and comments:** L2 15+ · L3 51+ · L4 151+ · L5 301-600, then +2 per 50.
- **Amplification quality:** L2 1-2 peer builders · L3 3+ peers or one sub-10k founder · L4 one notable (10k+) reshare · L5 multiple notables, PH feature, press or investor amplification.
- **Visitors to product** (read-only analytics access required or capped at L2): L2 51+ · L3 251+ · L4 1,001+ · L5 3,000+, then +10 per 300.
- **Signups or meaningful actions (Virality)** (your own test accounts do not count): L1 up to 25 · L2 26+ · L3 101+ · L4 501+ · L5 1,501-5,000, then +25 per 200.

### evidence caps and anti-spoof

L4 or L5 needs verifiable evidence or the row caps at L3. Virality visitors without read-only analytics access cap at L2. No evidence, no bonus. Virality anti-spoof: visitors above impressions / 10, or signups above visitors / 2, drop that row to L1 unless a direct source is proven.

### where the points are

The two rows of my track I will build for: Signups or meaningful actions (25x) and Visitors to product (10x).

### competence floor

Impressions, reactions and amplification need basic launch evidence, but should not pull time away from the working product and action tracking.

### rubric traps

Do not count anonymous visits as meaningful actions. Do not count your own tests. Do not rely on visitor numbers without read-only analytics. Do not build a partner portal instead of the share/call flow. Do not make a pretty directory that nobody acts on.

## 7. gtm plan

### where the users already are

| Channel (group, feed, thread, office floor) | Who is there | How I reach them (post, DM, invite) | When (day) |
|---|---|---|---|
| WhatsApp DMs | Dhruva, Tapish, Shruti | Send the live link and watch them use it | Monday |
| GrowthX community | Builders and operators, some Bangalore sports fans | Launch post asking people to test and share with F1 friends | Tuesday |
| WhatsApp groups | Friends who watch F1 or go out in Bangalore | Direct invite after first user feedback | Tuesday-Wednesday |

### distribution posts, in my own words

- Monday, after the first three users: "Testing a tiny Bangalore F1 screening finder. Enter your area, get one pub plan to send to friends. Can you try it once and tell me if you would actually use the result?"
- Tuesday, the launch post: "Built a Fanzo-style F1 screening finder for Bangalore. It shows the next race, asks your area, then gives one pub invite plan plus two backups. Looking for Bangalore F1 fans to test it before race weekend."
- Wednesday to Friday, one update each evening (what changed, one number): "Update: fixed [blocker]. [number] people clicked Share/Call."
- Saturday, the shipped post: "Shipped the Bangalore F1 watch-plan finder for Build Week. Here is what changed from first user tests and the numbers I can prove."

### targets, per band of my track's rows

| Row | Track | Floor I will hit (band) | Stretch (band) | How I will know (source) |
|---|---|---|---|---|
| Visitors to product | Virality | L2: 51 to 250 | L3: 251 to 1,000 | PostHog / Plausible / GA4 / Datafast, read-only access shared |
| Signups or meaningful actions | Virality | L2: 26 to 100 | L3: 101 to 500 | Convex table count of Share invite / Call pub, screenshot |
| Impressions and views | Virality | L2: 501 to 5k | L3: 5k to 15k | Platform analytics screenshots |
| Reactions and comments | Virality | L2: 15 to 50 | L3: 51 to 150 | Platform post screenshot |
| Amplification quality | Virality | L2: 1-2 peer builders | L3: 3+ peers or one sub-10k founder/operator | Screenshot of who engaged |

### analytics setup (do this on Sunday, not Saturday)

- Analytics tool installed on the live URL:
- Read-only access created and the link saved:
- Signup or first-use event writes to Convex:
- Payment link, if any: none for V1.

### the numbers I will report on Saturday

One line per row, with the screenshot or link that proves it: visitors, Share invite clicks, Call pub clicks, emails captured after action, GrowthX post views, reactions and comments.

## 8. the milestone ladder

Every milestone has a purpose, what is required, an acceptance test, and an "if I am behind, cut to this" fallback. Dates are fixed by the event.

### M0 — feasibility and setup (Sat 29 Aug, before 2:00 PM)

**Purpose:** kill the unknown critical dependency and the riskiest assumption early.

Required:
- Setup page complete: GitHub, Vercel, Convex accounts; Codex or Claude Code logged in; skills installed.
- The riskiest assumption tested with no code: call/check 5 F1 pubs and send a mock result to Dhruva, Tapish and Shruti.
- One representative hard input handled manually: "near HSR."
- Repository created, empty app deployed to Vercel, URL opens.

Acceptance test:

> The empty app is live at a public URL, the repo exists, and the riskiest assumption has a written result.

Stop condition:

> If at least 5 plausible F1 venues cannot be sourced by 4:00 PM Saturday, switch to a static "known F1 venues in Bangalore" board and keep Share/Call tracking.

### M1 — one ugly complete flow (Sat 29 Aug evening -> Sun 30 Aug)

**Purpose:** the smallest end-to-end version of the core action, working without you explaining it. Milestone 02 of the week.

**Rubric intent:** Virality: the personal artifact exists, even if ugly.

Required:
- next F1 main race shown;
- one area input;
- minimum venue ranking;
- one best pub invite plus two backups;
- Share invite or Call pub action;
- email captured after action click;
- action stored in Convex, with code-file fallback if Convex blocks progress;
- deployed to Vercel, pushed to GitHub.

Explicitly excluded: polished UI; partner portal; all sports; GPS; booking; payments; automated venue scraping; qualifying/practice.

Acceptance test:

> Someone who has never seen the product enters "Bellandur" at the live URL, sees one best Italian GP pub invite plus two backups, enters email after clicking Share/Call, and completes the action on their phone without you talking.

If I am behind, cut to: `one screen, hardcoded next race, 8 venue code-file list, Share invite text copied to clipboard, no Convex until later that night.`

### M2 — first users (Mon 31 Aug, evening)

**Purpose:** milestone 03. Three people who have the problem use it while you watch.

Required:
- Dhruva, Tapish and Shruti reached on WhatsApp;
- a first-use event recorded for each;
- notes on where each one stopped;
- the single biggest blocker named.

Acceptance test:

> Three rows in the Convex table that are not you, and one sentence per user on where they stopped.

If I am behind, cut to: `one user on a call, screen shared.`

### M3 — distribute (Tue 1 Sep, evening)

**Purpose:** milestone 04. Share it where those users already spend time. Direct invites. Track who signs up or replies.

Required:
- analytics live with read-only access;
- GrowthX community launch post written in your own words;
- direct WhatsApp invites sent;
- visitors and meaningful actions checked that night.

Acceptance test:

> The post is up, the invites are sent, and the visitors and Share/Call counts for the day are written down with screenshots.

If I am behind, cut to: `twenty direct WhatsApp messages, no public post.`

### M4 — build, user calls, build again (Wed 2 -> Fri 4 Sep, evenings)

**Purpose:** milestone 05. Speak to users, fix the biggest blocker, ship the next version. Repeat.

Required each evening:
- one user conversation;
- one blocker fixed and deployed;
- one update posted with one number;
- the rubric table in section 6 re-scored.

Rubric intent: the WhatsApp invite gets shared, visitors and meaningful actions climb a band.

Acceptance test:

> Three deploys across three evenings, each with a CHANGELOG line saying what a user can now do that they could not before.

If I am behind, cut to: `fix only the blocker that stops Share/Call; no new features.`

### M5 — verify and submit (Fri 4 Sep night -> Sat 5 Sep, 11:00 AM)

**Purpose:** milestone 06. No new features.

Required:
- core action works at the live URL, logged out, on a phone;
- data survives closing and reopening;
- repo is public and opens in a private window;
- numbers written down with screenshots and read-only analytics access shared;
- self-scored on every Virality row and any bonus row claimed;
- one honest paragraph: what I built, who it is for, why they care, link;
- submitted before 11:00 AM IST.

Acceptance test:

> Two consecutive runs of the demo script (section 9) on the live URL, one of them on someone else's device.

### M6 — demo (Sat 5 Sep, 3:00 PM)

Show what you shipped. Reproduce the numbers live. Do not pitch what it could become.

## 9. demo contract (Saturday 3:00 PM)

### one-sentence setup

Fanzo Bangalore helps F1 fans pick one pub plan for the next race without checking five apps and calling every venue.

### the proof

| Time | What happens | What the reviewer sees | Rubric row it supports |
|---:|---|---|---|
| 0-15s | who has this problem and what they do today | Tapesh's match-night problem and the old workaround | Reactions / pain proof if claimed as bonus |
| 15-60s | the core action, live, on a fresh input | Enter "near HSR", see next F1 race, best pub invite and two backups | Signups or meaningful actions / artifact |
| 60-90s | the numbers, reproduced live | Convex Share/Call count, analytics visitors, GrowthX post screenshot | Heaviest Virality rows |
| 90-120s | what broke this week and what changed | One blocker from user tests and the deployed fix | Live product quality bonus if claimed |

### live input

`near HSR`

### fallback input

`Bellandur`

### the number I lead with

Share invite and Call pub clicks.

### claims I can prove

- The product returned one best F1 pub plan and two backups.
- The action was recorded after email capture.
- The venue evidence tag was visible.
- Visitor analytics came from a read-only analytics source.

### claims I must not make

- Real-time pub confirmation unless marked Verified.
- Full Bangalore coverage.
- Partner portal exists.
- All sports supported.
- Ticket booking or guaranteed seating.

## 10. test plan

### golden cases

| Case | Why representative | Expected final output | Status |
|---|---|---|---|
| 1 | Tapesh's real area | Bellandur returns one best F1 pub plus backups | Specified |
| 2 | Vague nearby input | "near HSR" maps to HSR/Sarjapur/Koramangala options | Specified |
| 3 | Central Bangalore input | "MG Road" returns central venues and invite text | Specified |

### failure cases

| Failure | Expected behaviour | User recovery | Tested? |
|---|---|---|---|
| Ambiguous input | Ask for a clearer Bangalore area or show popular F1 zones | User edits area | No |
| Unsupported input | Explain V1 is Bangalore F1 only | User enters Bangalore area | No |
| API timeout or failure | No API should block V1; use stored venue data | User can still see results | No |
| Empty result | Show top Bangalore F1 venues marked by evidence tag | User can call/check | No |

## 11. risk register

| Risk | Probability | Damage | Earliest test | Mitigation | Fallback |
|---|---|---|---|---|---|
| Pub data is wrong | High | Users lose trust | Call/check 5 venues | Evidence tags, timestamp | Needs call instead of Verified |
| Users browse but do not share/call | Medium | Weak Virality score | Test with first 3 users | One best invite, clear CTA | Make Call pub primary |
| Convex setup takes too long | Medium | No reliable action counts | M0 setup | Keep code simple | Local code list + add Convex later |
| Scope expands | High | No live product | Every session | Parking lot | One screen only |
| GrowthX post gets low traffic | Medium | Low visitor count | Tuesday post | Direct WhatsApp invites | DM 20 people |

### pre-mortem

It is Saturday 11:00 AM and the product is not submitted, or is submitted with no users, because:

1. The product became a venue marketplace instead of a one-action F1 invite finder.
2. Pub verification was weak and users did not trust the result.
3. Analytics/action tracking was added too late.

## 12. non-goals

Explicitly outside this week's build:

1. Partner portal for restaurants.
2. All sports and all Indian cities.
3. GPS, live distance, booking, payments, ticketing, food ordering.
4. Qualifying and practice screenings.
5. Automated scraping as a critical dependency.

Any change to these requires a written scope decision in section 15.

## 13. parking lot

| Idea | Potential value | Why not now | Revisit after |
|---|---|---|---|
| Restaurant partner portal | Makes screening data real-time | Too much build and sales work this week | After V1 usage proof |
| Football/cricket support | Bigger audience | More match data and venue verification | After F1 flow works |
| Shareable image card | Better virality | WhatsApp text is faster and closer to the job | After Share clicks happen |
| Group midpoint venue | More magical | Needs location logic and more edge cases | After area matching works |
| Pub claim flow | Improves data quality | Requires trust and moderation | After venue demand exists |
| Auto-publish venue signals | Faster coverage | Too risky without human approval | After enough approved signals behave well |
| Instagram scraping | Strong pub evidence | Scraping risk and rate limits | After official/public search path works |

## 14. current state

### active milestone

M1 — one ugly complete flow.

### implemented

- Separate `sports-party` project exists.
- Customer-facing product has a separate first screen and recommendations screen.
- Real Bangalore F1 venue data exists in a local code file.
- Convex is connected for searches and email-gated Share/Call actions.
- `/admin` shows saved searches and Share/Call actions for demo proof.
- `/admin/venues` can search public web signals through Tavily, save drafts, and approve/reject venue candidates before customer display.

### working locally

- Next.js app runs locally on `http://localhost:3002`.
- `/` runs locally as the broad Fanzo sports landing page.
- `/f1` runs locally as the customer F1 finder product.
- `/admin` runs locally as the internal proof page.

### live

-

### verified

- TypeScript typecheck passes locally.
- Convex codegen passes.
- `/`, `/f1`, `/admin` and `/admin/venues` return `200 OK` locally.

### current blocker

Vercel and visitor analytics are not set up for the new `sports-party` project yet.

### next single action

Create the public GitHub repo, deploy to Vercel, then add visitor analytics with read-only access.

## 15. decision log

| Time | Decision | Evidence/reason | Scope impact |
|---|---|---|---|
| Tue 1 Sep 2026 | Picked Fanzo Bangalore F1 screening finder | User chose this idea after pausing Creator Fit Finder | New project scope |
| Tue 1 Sep 2026 | Primary track is Virality | WhatsApp invite is the share artifact | Build for Share/Call actions and visitors |
| Tue 1 Sep 2026 | V1 supports F1 main race only | Most venues support main race watch parties, not practice/qualifying | Cuts sports/calendar scope |
| Tue 1 Sep 2026 | Input is free-text Bangalore area | Whole Bangalore coverage matters, but area helps ranking | No full one-sentence brief needed |
| Tue 1 Sep 2026 | Share/Call requires email first | Captures meaningful action after user sees value | Adds Convex signup/action tracking |
| Tue 1 Sep 2026 | Proof table moved to `/admin` | Customer-facing product should not show internal evidence tables | Keeps `/` clean and keeps demo proof separate |
| Tue 1 Sep 2026 | Added hybrid Tavily data pipeline | User wanted smart online data discovery, filtering, approval, then customer display | Adds `/admin/venues`, Convex venue candidates, and approved signals in product ranking |
