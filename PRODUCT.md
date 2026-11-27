# Product Context — Pinnate

## Platform
web

## Brand Identity
- **Name:** **Pinnate** (pronounced **"PIN-ayt"**)
- **Positioning:** A calm place to pin your plans, move them through stages (`To Do`, `In Progress`, `Done`), and see how much you've finished.
- **Short tagline:** *Pin it. Move it. Finish it.* (`Pin a plan. Move it forward. Watch it get done.`)
- **Logo Mark:** A stylized **pinnate leaf** inside a rounded square ink container (`#18181b` light / `#ffffff` inverse): central vein with paired leaflets, terminal/done leaflet in orange (`#f97316`), simplifying to central vein + 2 leaflet pairs at compact `16px–20px` sizes. No red pushpin in the brand mark.

## Users & Jobs
- **Visitors (Guest Scratchpad — `/scratchpad`):** Capture rough thoughts in seconds in `localStorage` (`notes_guest_drafts`) with zero signup friction, then sync automatically on account creation or login.
- **Workspace Members (`/dashboard`, `/scratchpad`, `/insights`, `/archive`, `/profile`):**
  - Capture quick ideas in **Scratchpad** without cluttering the main board, then promote them with **Add to notes** or **Add to Board** (`To Do`).
  - Organize notes with **Pin** (pin important items to the top), **#Folders**, `Grid / Stream / Board` views (`To Do`, `In Progress`, `Done`), full-text search, soft archive (`/archive`), and JSON/Markdown/Text export/import with real-time Socket.IO sync.
  - Review calm, factual consistency and plan completion on **Progress** (`/insights`) without streak counters, due-date nags, or guilt cues.

## Core Workflows
1. **Guest Capture -> Account Sync:** `/scratchpad` (`ScratchpadQuickJot` / `NoteEditor` -> `localStorage`) -> `/signup` or `/login` (awaited `syncGuestNotesIfAny`) -> `/dashboard`.
2. **Scratchpad -> Board Promotion:** Authenticated `/scratchpad` -> **Add to notes** / **Add to Board** (`POST /api/notes`) -> removed from local Scratchpad.
3. **Plan Flow & Keyboard Navigation:** `QuickAdd` bar (`Q` / `T`), `CommandPalette` (`Ctrl+K` / `Cmd+K`), `useDeskKeyboardNav` (`J/K/Enter/P/D/Z/N///?/Q`), collapsible `#Folders` tree, and `UndoToast` soft delete.

## Honest Product Truths (Never Overclaim)
- Stages are currently fixed at **To Do**, **In Progress**, and **Done** (do not claim custom stage naming until shipped).
- There are **no due dates**, reminders, streak counters, or outbound email flows implemented in the backend (`POST /api/auth/register` & `/api/auth/login` only).
- Real actions require a click/Enter — avoid `"zero effort"` phrasing (`"Capture in seconds, move plans in a click"`).

## Vocabulary Contract
| Use | Avoid |
|---|---|
| Pinnate, Pin, Board, Stage, Scratchpad, Progress, Done, Add to notes, Quick add | Tack, Desk, Cloud Desk, Draft Blotter, Notes Workspace, Notes App |
| `"You worked on 3 notes this week"` | Streaks, `"behind"`, `"overdue"`, `"don't break the chain"` |
| `"Capture quickly, then move notes onto your board."` | Hyped marketing copy (`"supercharge"`, `"10x"`, `"zero effort"`) |

## Color Semantics
- **Base paper:** Off white (`#fafafa`) & crisp card white (`#ffffff`)
- **Ink:** Near black (`#18181b`) for typography, crisp framing borders, and primary buttons
- **Blue (`#0ea5e9` / `#0369a1`):** Activity charts, motion threads, and **In Progress** stage only
- **Orange (`#f97316` / `#9a3412`):** **Done** stage, completion ring segment, and finished pinnate leaf only
- **Pastels:** `Slate` (`#ffffff`), `Sage` (`#dcfce7`), `Sky/Teal` (`#e0f2fe`), `Sand` (`#fef9c3`), `Lavender` (`#ede9fe`), `Rose` (`#ffe4e6`) for note cards only
- **Red (`#ef4444`):** Pushpin indicator on **pinned cards only** (`--danger-text` `#b91c1c` reserved for errors/destructive confirmations)

## Motion Grammar
- Calm and slightly hand drawn: organic cubic-Bézier curves, gentle spring settle with slight overshoot on pinned/moved cards, blue-to-orange fog reveal, and autonomous scroll leaf ending.
- Never loop while a user focuses or types in a form; provide instant static `prefers-reduced-motion` parity everywhere.

## Trademark & Publishing Pre-Flight
Before public distribution under **Pinnate**: verify **TMview**, **WIPO Global Brand Database**, **USPTO**, target domains, **App Store**, and **Google Play** availability.



Notion vs Pinnate ?
I looked at your Notion screenshots and searched for why people leave Notion. Most of the evidence comes from blogs, forums, and review sites, not interviews, so treat it as strong hints that you still need to check with real users.

What your Notion screenshots show
The tracker is a template you have to read before using. There's a cover image, instruction text ("Upload your resume…", "Move your applications along the stat…"), and an upload block before the board.
The board is flexible. Stages are custom (To apply, Applied, Offer), with multiple views ("Grouped by stage", "All applications", "Add a new view").
The toolbar is crowded. Eight or so icons for filter, sort, automation, search, and settings sit above the board, plus a "New" button with a dropdown.
The sidebar is full: Home, chat, Library, calendar prompt, Shared, Private pages, an invite card, and "Customize sidebar".
I don't see any progress summary on that page. It tells you where cards are, not how far you've come. (I only saw part of the page.)
What people say Notion lacks

Most of it comes down to effort before value:

Setup cost. One comparison says people leave because the setup tax outweighs the daily return, and quick capture turns into building the container first. The setup cost can outweigh the daily benefit for people who need to move fast (note: that's a competitor's blog). 
xtiles
Tinkering instead of working. One writer opened Notion to jot one idea and spent forty minutes improving a template and wrote nothing. Another says people never stop tweaking their setups, so the actual work gets neglected. 
dev
medium
Too much freedom. A project manager says giving people too much freedom makes them over engineer, and she prefers tools with built in guardrails. 
thedigitalprojectmanager
Progress is hard. One reviewer notes that even a progress bar requires long formulas. Another says most rollup data goes unused, because people configure metrics they check once. Reviews on a competitor's blog also mention difficulty tracking project progress. 
Why I stopped using Notion (an honest UX review)
 +2
Slow and weak offline. Reviewers report slow mobile use and no proper offline mode. Notion only caches recently viewed pages, not the whole workspace. 
capterra
dev
Not a quick capture tool. One reviewer says Notion is not a quick note taking app, which works both for and against it. A whole category of add ons exists because of it, like a capture app built by someone tired of Notion's slow loading for a quick thought. 
Android Police
producthunt
Where Pinnate can fill the gap
Gap	Pinnate today	Opportunity
Setup before the first note	Scratchpad and Quick add work immediately, board has three default stages	First note with zero setup. No templates, covers, or instruction text
Progress needs formulas	Progress page reads from where notes are	Make it the hero: automatic, no configuration
Over customizing	Fixed To Do, In Progress, Done	Treat fixed stages as a feature (the "right amount of constraint")
Slow and offline capture	Scratchpad is stored locally	Measure capture time before you claim "fast". Promise offline only for what you've tested
Notes and structure are separate worlds	Capture, then move onto a board	Make "from rough thought to done" one short path
Nothing says how you're doing	Progress page	Gentle, honest summary, no streak guilt
What Notion does better (don't compete here)

Custom stages and properties, databases and multiple views, sharing and team features, templates, AI chat, and calendar integration. If you add custom stage names, keep it to renaming a few stages, not building a property system, or you become Notion with less polish.

A caution: people who leave Notion often go to something simpler, not to another tracker. Your nearer rivals are Apple Notes, Google Keep, Trello, and Todoist, so test Pinnate against them too.

Validating it with real people

Talk to 5 people who tried Notion for tracking and stopped, about 20 minutes each.

Interview: "Walk me through the last time you opened Notion to track something." "What did you do before you wrote the first thing?" "What made you stop?" "How do you know if you're making progress now?"
Task test: give them Pinnate and ask them to capture three thoughts and move one forward. Time it, and watch where they hesitate.
Five second test: show the Progress page for five seconds, hide it, and ask "How do you think you're doing?"
Signals to record: time to first note, any "where do I click?", and any word like "behind" or "guilty" when they see progress.

I can turn this into a one page interview guide, or compare Pinnate with Trello and Todoist next. Which first?