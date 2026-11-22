# RescueLoop — Hyderabad Surplus Food Rescue

**RescueLoop** is a role-based surplus food rescue coordination web app built for Hyderabad's catering and event ecosystem. It connects caterers and banquet kitchens (**Donors**) with nearby NGOs and community kitchens (**Receivers**) and local dispatch drivers (**Volunteers**) to move safe, surplus meals from events to communities before pickup windows expire.

> **Live Demo:** `https://rescue-loop.vercel.app`

---

## The Problem & Why RescueLoop

Corporate events, weddings, and banquet caterers across Hyderabad (Gachibowli, Madhapur, Kondapur, Jubilee Hills, and Banjara Hills) regularly finish service with 20–100+ untouched portions of surplus food. Today, coordination happens over ad-hoc phone calls and WhatsApp groups—meaning food expires before an NGO with matching dietary needs and capacity can claim it, volunteers lack structured handover checks, and caterers have zero visibility into how much money they lose to repeated overcooking.

**RescueLoop solves all three sides in one lightweight workspace:**
1. **For Caterers (Donors):** Post surplus food in under 60 seconds, track live pickup status and handover codes, see which dishes are repeatedly overcooked, estimate kitchen food waste value in INR, and export CSR impact reports (PDF & CSV).
2. **For NGOs & Community Kitchens (Receivers):** Browse available food with transparent **Smart Match** scoring (zone proximity, capacity fit, dietary preference, and pickup timing) and claim listings in one click.
3. **For Dispatch Drivers (Volunteers):** Receive zone-matched pickup suggestions, verify sealed containers and storage conditions via a 4-digit Handover Code checklist, copy ready-to-send WhatsApp dispatch summaries, and track every rescue through a 4-stage timeline (`Posted → Claimed → Collected → Delivered`).

---

## 2-Minute Judge Walkthrough (Where to Click & What Happens)

Because this is a self-contained interactive demo (no login wall required), you can test all three roles directly from the top-right **Role Switcher** pill (`Donor | Receiver | Volunteer`).

1. **Start Fresh (Optional):** Click **Reset Demo** in the top-right header at any time to reload fresh Hyderabad sample listings with active countdown timers.
2. **Explore Impact Dashboard (Default Tab):**
   - View **Urgency Alerts** at the top—clicking **Assign volunteer** or **Open My Pickups** automatically switches your role to **Volunteer** and opens `My Pickups`; clicking **Open Find Food** switches you to **Receiver** and opens `Find Food`.
   - Inspect the live 4-stage pipeline (`Posted`, `Claimed`, `Collected`, `Delivered`) and estimated KPI cards (`Meals saved`, `Food waste avoided`, `CO2e avoided`).
   - **Click any zone node** on the interactive **Hyderabad zones at a glance** SVG map (urgent zones with `< 60 min` Posted listings pulse in amber/red) to jump straight to `Find Food` filtered to that zone.
   - Scroll to **Caterer & CSR Insights**: view horizontal bar charts for most-posted dishes and rescues by caterer, toggle the `₹60 / ₹85 / ₹120` buttons (or type a custom rate) in **Kitchen Overcooking Cost Estimate** to see live `en-IN` INR totals, and test **Copy CSR summary**, **Download CSV log**, and **Download PDF report**.
3. **Post a Listing as Donor (`Post Surplus` tab):**
   - Switch to **Donor** (if viewing as Receiver/Volunteer, the form locks behind a read-only prompt with a 1-click **Switch to Donor** button).
   - Click a quick-pick dish (e.g., `Veg Biryani`), choose portions (`40`), select a Hyderabad zone (`Gachibowli`), pick `1 hr from now`, choose `Hot Box`, check the accuracy confirmation box, and click **Post listing**.
4. **Claim with Smart Match as Receiver (`Find Food` tab):**
   - Switch to **Receiver** and select a receiver kitchen from the **Matching for** dropdown (e.g., `Asha Community Kitchen`).
   - Review the **Smart Match** percentage badge and transparent 4-factor breakdown (`Zone 25% · Portions 25% · Diet 25% · Timing 25%`), then click **Claim**.
   - Hop back to **Post Surplus → Recently Posted Listings** to see your listing updated to `Claimed` with its newly generated amber **4-digit Handover Code** badge.
5. **Verify Handover & Deliver as Volunteer (`My Pickups` tab):**
   - Switch to **Volunteer** (Donor and Receiver views show a read-only banner with a 1-click **Switch to Volunteer** button).
   - Click **Copy WhatsApp dispatch** on any card to copy a formatted plain-text dispatch brief (food, portions, zone, caterer, NGO, pickup deadline, storage, allergens, and handover code).
   - On a `Claimed` card, notice **Mark Collected** stays disabled until both basic handover checks (*Containers sealed & intact* and *Storage matches listing*) are ticked. Tick both, click **Mark Collected**, then click **Mark Delivered** to watch the 4-step progress timeline complete.
6. **Audit & Download Per-Donation Receipt (`History` tab):**
   - Open **History** to inspect all `Delivered` rescues with full timestamps (`Posted → Claimed → Collected → Delivered`).
   - Filter by Hyderabad zone, click **Download CSV** to export only the filtered rows, or click **Download PDF** on any rescue card to save a styled 1-page A4 Donation Handover Summary directly to Downloads.

---

## Complete Feature Breakdown

### Navigation & Role-Based Access
- **Sticky Frosted Header & Brand Identity:** Custom SVG RescueLoop emblem (matching browser tab favicon), `Plus Jakarta Sans` typography, segmented pill **Role Switcher** (`Donor`, `Receiver`, `Volunteer`), and **Reset Demo** button.
- **Role Guardrails:** Each workflow enforces role boundaries gracefully—non-Donors cannot submit `Post Surplus`, and non-Receivers/non-Volunteers see helpful read-only banners with 1-click role-switch buttons on `Find Food` and `My Pickups`.
- **Smart Stale-Demo Auto-Refresh:** Demo state persists in `localStorage`. If a returning user opens an older session where every `Posted` listing has been expired for more than 6 hours, the store automatically regenerates fresh demo timestamps on load.

### Tab-by-Tab Capabilities
| Tab | Primary Role | Key Features |
|---|---|---|
| **Impact Dashboard** | All Roles | Urgency alerts with auto-role routing, 4-stage live pipeline counters, KPI estimate cards, clickable 5-zone Hyderabad SVG map with urgent ring pulse, dish/caterer horizontal bar charts, editable INR Kitchen Overcooking Cost Estimator, 1-click Copy CSR Summary, CSV Log export, and styled A4 CSR PDF Report download. |
| **Find Food** | Receiver | Zone and Veg/Non-Veg filters, "Show already claimed" toggle, receiver NGO selector, transparent 4-factor Smart Match scoring + `Best Match` badge, zone-matched volunteer suggestion, allergen tags, storage guidance, and 1-click Claiming. |
| **Post Surplus** | Donor | 1-click quick-pick dishes (`Veg Biryani`, `Paneer Curry`, `Dal & Rice`, `Mix Veg & Roti`), portion presets (`20`, `40`, `60`, or custom), 5 Hyderabad zones, pickup window presets (`1 hr`, `2 hrs`, `3 hrs`), storage conditions (`Hot Box`, `Chilled`, `Room Temp`), optional handling notes, allergen checkboxes (`Dairy`, `Nuts`, `Gluten`, `Soy`, `None`), confirmation checkbox, and Recently Posted Listings tracker with live Handover Code badges. |
| **My Pickups** | Volunteer | Active `Claimed` and `Collected` rescue cards, 4-digit Handover Code display, 4-step timestamped progress bar, volunteer assignment dropdown with zone-based suggestions, mandatory 2-checkbox handover verification before collection, **Mark Collected** / **Mark Delivered** controls, and 1-click **Copy WhatsApp dispatch**. |
| **History** | All Roles | Completed (`Delivered`) rescue audit log showing estimated kg saved, caterer, NGO, volunteer, zone, and full 4-stage timestamps, zone filter, zone-filtered **Download CSV**, and per-card **Download PDF** donation handover receipts. |

### Export Capabilities (Zero Backend Required)
- **CSR Impact Report PDF (`RescueLoop-CSR-Impact-Report-YYYY-MM-DD.pdf`):** Client-side A4 PDF generated via `jsPDF` with branded green header, 3 framed KPI cards, Caterer & Kitchen Waste Summary (in `INR`), Delivered rescues table, and disclaimer footer.
- **Per-Donation Handover Receipt PDF (`RescueLoop-Donation-<food>-<zone>-<id>.pdf`):** Individual A4 handover summary containing Rescue ID, 4-digit Handover Code badge, Donor/NGO/Volunteer details, estimated impact, 4-step handover timeline, storage/allergen notes, and disclaimer footer.
- **Excel-Safe CSV Export (`rescueloop-impact-log.csv`):** 15-column UTF-8 BOM CSV (`ID`, `Food`, `Diet`, `Portions`, `Est Kg Saved`, `Est CO2e Kg`, `Caterer`, `Receiver NGO`, `Volunteer`, `Zone`, `Handover Code`, `Posted`, `Claimed`, `Collected`, `Delivered`) with quoting and formula-injection sanitization (`=`, `+`, `-`, `@`).

---

## Impact Calculation Methodology

All impact figures on the dashboard, CSV logs, and PDF reports count **Delivered** listings only using transparent baseline multipliers defined in `src/lib/impact.js`:
- **Meals saved:** `1 portion = 1 meal`
- **Estimated food waste avoided:** `0.35 kg per portion`
- **Estimated CO2e avoided:** `2.5 kg CO2e per kg of food saved`
- **Estimated kitchen food value:** `Delivered portions × editable INR per portion` (default `₹85`, quick presets `₹60`, `₹85`, `₹120`)

---

## Tech Stack & Project Structure

- **Frontend:** React + Vite
- **Styling & Animations:** Tailwind CSS + lightweight CSS keyframes (`fadeSlideIn`, `urgentPulse`, respecting `prefers-reduced-motion`)
- **PDF Generation:** `jspdf` (client-side A4 reports & receipts)
- **Charts & Map:** Zero external chart/map libraries (custom inline SVG Hyderabad zone map & proportional Tailwind bar charts)
- **State Persistence:** Browser `localStorage` via custom `useStore` hook with dynamic timestamp factory

```text
RescueLoop/
├── index.html                   # App entry, SVG favicon, Plus Jakarta Sans font
├── public/
│   └── favicon.svg              # Custom emerald loop-and-leaf brand favicon
├── src/
│   ├── App.jsx                  # Root layout, sticky frosted header, tab & zone state
│   ├── index.css                # Typography, surface theme, keyframe micro-animations
│   ├── components/
│   │   ├── Logo.jsx             # Inline SVG RescueLoop brand mark
│   │   ├── TopBar.jsx           # Brand header, RoleSwitcher, Reset Demo button
│   │   ├── RoleSwitcher.jsx     # Segmented pill Donor / Receiver / Volunteer toggle
│   │   ├── NavTabs.jsx          # 5-tab navigation bar with active emerald indicator
│   │   ├── UrgencyAlerts.jsx    # Overdue / expiring / unassigned alerts with auto-routing
│   │   └── ZoneMap.jsx          # Interactive 5-zone Hyderabad inline SVG map
│   ├── pages/
│   │   ├── ImpactDashboard.jsx  # Pipeline, KPIs, ZoneMap, ROI calculator, CSR exports
│   │   ├── FindFood.jsx         # Smart Match ranking, filters, and Receiver claiming
│   │   ├── PostSurplus.jsx      # 60-second Donor posting form & recent listings tracker
│   │   ├── MyPickups.jsx        # Volunteer handover checklist, WhatsApp copy & timeline
│   │   └── History.jsx          # Delivered rescue log, zone CSV & per-card PDF receipts
│   ├── data/
│   │   └── seed.js              # Hyderabad zones, demo NGOs, volunteers & dynamic listings
│   ├── state/
│   │   └── useStore.js          # localStorage store, handover code generator & demo reset
│   └── lib/
│       ├── impact.js            # Meal, kg, and CO2e estimate calculations
│       ├── export.js            # Excel-safe 15-column CSV export helper
│       └── pdf.js               # Client-side jsPDF CSR report & donation receipt builders
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## Run Locally

### Prerequisites
- Node.js 18+ and npm

### Setup & Start
```bash
git clone https://github.com/O-K1ng0/RescueLoop
cd RescueLoop
npm install
npm run dev
```
Open the local URL printed by Vite (typically `http://localhost:5173`).

### Production Build
```bash
npm run build
npm run preview
```

---

## Demo Data & Disclaimers

- **Fictional Demo Data:** All preloaded caterers, community kitchens, volunteers, and listings are fictional Hyderabad sample data (labeled `(demo)` across the app). Click **Reset Demo** at any time to reset local browser state and generate fresh countdowns.
- **Estimates Only:** Meal, weight (`0.35 kg/portion`), emissions (`2.5 kg CO2e/kg`), and INR kitchen food value figures are rough internal estimates for operational visibility—not audited impact numbers or financial, tax, or legal advice.
- **No Food Safety Certification:** RescueLoop is a coordination tool connecting donors, receivers, and volunteers. Storage guidance, allergen labels, and the volunteer pickup checklist are basic coordination aids, not verified food safety certifications. Donors and receivers remain responsible for verifying food suitability at handover.