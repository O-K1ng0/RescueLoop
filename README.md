# RescueLoop - Hyderabad Surplus Food Rescue

RescueLoop is a web app for coordinating surplus food rescue across Hyderabad. It connects caterers and event kitchens (Donors) with nearby NGOs and community kitchens (Receivers) and local pickup drivers (Volunteers) so leftover event food gets claimed and delivered before pickup windows expire.

**Live Demo:** https://rescue-loop.vercel.app

## The Problem

Event caterers and banquet kitchens in Hyderabad (Gachibowli, Madhapur, Kondapur, Jubilee Hills, and Banjara Hills) often finish events with 20 to 100+ untouched portions of food. Right now, most coordination happens over phone calls and WhatsApp messages. Food frequently expires before a matching NGO is found, volunteers do not have a structured handover check, and caterers have no way to see which dishes they keep overcooking.

RescueLoop puts all three sides in one workspace:

1. **Donors (Caterers):** Post surplus food in under a minute, track pickup status and 4-digit handover codes, spot repeatedly overcooked dishes, estimate kitchen waste value in INR, and download CSR reports as PDF or CSV.
2. **Receivers (NGOs / Community Kitchens):** Browse available listings ranked by a transparent Smart Match score (zone distance, meal capacity, diet preference, and pickup window) and claim food in one click.
3. **Volunteers:** See zone-matched pickup assignments, complete a quick 2-item container/storage check before collection, copy ready-to-send WhatsApp dispatch text, and update each rescue from Claimed to Collected to Delivered.

## How to Test the App (Step-by-Step Walkthrough)

There is no login screen so reviewers can test all three roles immediately using the **Donor / Receiver / Volunteer** toggle in the top-right header.

1. **Reset Demo (Optional):** Click **Reset Demo** in the top-right corner at any time to load fresh Hyderabad sample data with active pickup countdowns.
2. **Impact Dashboard (Default Tab):**
   - Check the **Urgency alerts** box at the top. Clicking **Assign volunteer** or **Open My Pickups** automatically switches your role to **Volunteer** and opens `My Pickups`. Clicking **Open Find Food** switches you to **Receiver** and opens `Find Food`.
   - View the live 4-stage pipeline (`Posted`, `Claimed`, `Collected`, `Delivered`) and the estimated impact cards (`Meals saved`, `Food waste avoided`, `CO2e avoided`).
   - Click any zone circle on the **Hyderabad zones at a glance** map (zones with urgent listings under 60 minutes pulse in amber/red) to jump straight to `Find Food` filtered to that zone.
   - Scroll to **Caterer & CSR Insights** to view the bar charts for most-posted dishes and rescues by caterer. Click the `₹60`, `₹85`, or `₹120` buttons (or type a custom rate) inside **Kitchen Overcooking Cost Estimate** to see the INR total update live.
   - Test **Copy CSR summary**, **Download CSV log**, and **Download PDF report**.
3. **Post Surplus (Donor Role):**
   - Switch to **Donor** (Receiver and Volunteer views show a locked message with a **Switch to Donor** button).
   - Pick a quick-fill dish (like `Veg Biryani`), choose portions (`40`), select a zone (`Gachibowli`), pick `1 hr from now`, choose `Hot Box`, tick the confirmation checkbox, and click **Post listing**.
4. **Find Food (Receiver Role):**
   - Switch to **Receiver** and pick a community kitchen from the **Matching for** dropdown.
   - Check the **Smart Match** score and 4-factor breakdown (`Zone`, `Portions`, `Diet`, `Timing` at 25% each), then click **Claim**.
   - Go back to **Post Surplus -> Recently Posted Listings** to see the listing marked `Claimed` with its newly generated 4-digit **Handover Code** badge.
5. **My Pickups (Volunteer Role):**
   - Switch to **Volunteer** (Donor and Receiver views show a read-only banner with a **Switch to Volunteer** button).
   - Click **Copy WhatsApp dispatch** on any card to copy a plain-text pickup brief with food name, portions, zone, caterer, NGO, pickup deadline, storage note, allergens, and handover code.
   - On a `Claimed` card, **Mark Collected** stays disabled until you tick both handover checks (*Containers sealed & intact* and *Storage matches listing*). Tick both, click **Mark Collected**, then click **Mark Delivered** to watch the 4-step progress bar complete.
6. **History (All Roles):**
   - View all `Delivered` rescues with full timestamps (`Posted`, `Claimed`, `Collected`, `Delivered`).
   - Filter by Hyderabad zone and click **Download CSV** to export only the filtered rows, or click **Download PDF** on any individual card to download a 1-page Donation Handover Summary PDF.

## Features by Tab

| Tab | Main Role | What It Includes |
|---|---|---|
| **Impact Dashboard** | All Roles | Urgency alerts with auto role-switching, live 4-stage pipeline counts, KPI estimate cards, clickable 5-zone Hyderabad SVG map, horizontal bar charts for dishes and caterers, editable INR overcooking cost calculator, Copy CSR summary, CSV export, and A4 PDF report download. |
| **Find Food** | Receiver | Zone and Veg/Non-Veg filters, "Show already claimed" toggle, receiver kitchen selector, 4-factor Smart Match score with Best Match badge, zone-matched volunteer suggestion, allergen tags, storage notes, and 1-click Claiming. |
| **Post Surplus** | Donor | Quick-pick dish buttons (`Veg Biryani`, `Paneer Curry`, `Dal & Rice`, `Mix Veg & Roti`), portion presets (`20`, `40`, `60`, custom), 5 Hyderabad zones, pickup window presets (`1 hr`, `2 hrs`, `3 hrs`), storage options (`Hot Box`, `Chilled`, `Room Temp`), optional handling notes, allergen checkboxes, confirmation checkbox, and Recently Posted Listings list with live Handover Code badges. |
| **My Pickups** | Volunteer | Active `Claimed` and `Collected` cards, 4-digit Handover Code, 4-step timestamped progress bar, volunteer selector with zone-based suggestions, mandatory 2-checkbox handover check before collection, Mark Collected / Mark Delivered actions, and 1-click Copy WhatsApp dispatch. |
| **History** | All Roles | Completed (`Delivered`) rescue log showing estimated kg saved, caterer, NGO, volunteer, zone, and full timestamps, zone dropdown filter, zone-filtered CSV export, and per-card Donation Handover PDF receipts. |

### Role Controls & Auto-Refresh
- **Role boundaries:** Non-Donors cannot submit the Post Surplus form, and non-Receivers or non-Volunteers get a read-only banner with a 1-click button to switch to the right role.
- **Stale demo protection:** State saves in browser `localStorage`. If someone opens an old browser session where every `Posted` listing expired more than 6 hours ago, the app automatically resets to fresh demo timestamps on load.

### Exports (100% Client-Side)
- **CSR Impact Report PDF (`RescueLoop-CSR-Impact-Report-YYYY-MM-DD.pdf`):** Styled 1-page A4 report built with `jsPDF` containing the RescueLoop header, 3 KPI boxes, Caterer & Kitchen Waste summary in INR, a table of Delivered rescues, and a disclaimer footer.
- **Donation Handover Receipt PDF (`RescueLoop-Donation-<food>-<zone>-<id>.pdf`):** Styled 1-page A4 receipt for a single rescue with Rescue ID, 4-digit Handover Code badge, Donor/NGO/Volunteer info, estimated impact, 4-step timeline, storage/allergen notes, and disclaimer footer.
- **CSV Audit Log (`rescueloop-impact-log.csv`):** 15-column UTF-8 BOM CSV (`ID`, `Food`, `Diet`, `Portions`, `Est Kg Saved`, `Est CO2e Kg`, `Caterer`, `Receiver NGO`, `Volunteer`, `Zone`, `Handover Code`, `Posted`, `Claimed`, `Collected`, `Delivered`) with field quoting and spreadsheet formula sanitization.

## Impact Calculation Formulas

All dashboard KPIs, CSV logs, and PDF totals count **Delivered** listings only (`src/lib/impact.js`):
- **Meals saved:** `1 portion = 1 meal`
- **Estimated food waste avoided:** `0.35 kg per portion`
- **Estimated CO2e avoided:** `2.5 kg CO2e per kg of food saved`
- **Estimated kitchen food value:** `Delivered portions x editable INR per portion` (defaults to `₹85`, quick options `₹60`, `₹85`, `₹120`)

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS + lightweight CSS animations (`fadeSlideIn`, `urgentPulse`, with `prefers-reduced-motion` support)
- **PDF Generation:** `jspdf`
- **Map & Charts:** Custom inline SVG Hyderabad zone map and Tailwind horizontal bars (no external chart or map packages)
- **Storage:** Browser `localStorage` via custom `useStore` hook

## Project Structure

```text
RescueLoop/
├── index.html                   # App entry, SVG favicon, Plus Jakarta Sans font
├── public/
│   └── favicon.svg              # RescueLoop emerald loop-and-leaf favicon
├── src/
│   ├── App.jsx                  # Main layout, sticky frosted header, tab & zone state
│   ├── index.css                # Base styles, typography, keyframe animations
│   ├── components/
│   │   ├── Logo.jsx             # Inline SVG brand logo
│   │   ├── TopBar.jsx           # Header bar, RoleSwitcher, Reset Demo button
│   │   ├── RoleSwitcher.jsx     # Segmented pill Donor / Receiver / Volunteer toggle
│   │   ├── NavTabs.jsx          # 5-tab navigation bar
│   │   ├── UrgencyAlerts.jsx    # Overdue / expiring / unassigned alerts with role routing
│   │   └── ZoneMap.jsx          # Interactive 5-zone Hyderabad inline SVG map
│   ├── pages/
│   │   ├── ImpactDashboard.jsx  # Pipeline, KPIs, ZoneMap, ROI estimate, CSR exports
│   │   ├── FindFood.jsx         # Smart Match ranking, filters, and Receiver claiming
│   │   ├── PostSurplus.jsx      # Donor posting form & recent listings tracker
│   │   ├── MyPickups.jsx        # Volunteer handover checklist, WhatsApp copy & timeline
│   │   └── History.jsx          # Delivered rescue log, zone CSV & per-card PDF receipts
│   ├── data/
│   │   └── seed.js              # Hyderabad zones, demo NGOs, volunteers & dynamic listings
│   ├── state/
│   │   └── useStore.js          # localStorage store, handover code generator & demo reset
│   └── lib/
│       ├── impact.js            # Meal, kg, and CO2e estimate calculations
│       ├── export.js            # 15-column CSV export helper
│       └── pdf.js               # Client-side jsPDF CSR report & donation receipt builders
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Run Locally

### Requirements
- Node.js 18+ and npm

### Start Dev Server
```bash
git clone https://github.com/O-K1ng0/RescueLoop.git
cd RescueLoop
npm install
npm run dev
```
Open the local URL shown in your terminal (usually `http://localhost:5173`).

### Build for Production
```bash
npm run build
npm run preview
```

## Demo Data & Disclaimers

- **Demo Data:** All preloaded caterers, NGOs, volunteers, and food listings are fictional Hyderabad sample data (marked `(demo)` across the UI). Use **Reset Demo** in the header to restore fresh sample countdowns.
- **Estimates Only:** Meal counts, food weight (`0.35 kg/portion`), CO2e (`2.5 kg/kg`), and INR food value totals are rough internal estimates, not audited impact numbers or financial/tax advice.
- **Coordination Only:** RescueLoop connects donors, receivers, and volunteers and does not certify food safety. Storage notes, allergen labels, and the volunteer pickup checklist are basic coordination aids, and donors and receivers remain responsible for checking food condition at handover.