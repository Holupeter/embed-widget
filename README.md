# 🚀 OnboardJS - Embeddable Tour Widget

A high-performance, standalone onboarding widget built for the HNG Internship. This widget is designed to be embedded into any third-party website to guide users through a multi-step tour.

It features **Shadow DOM isolation**, **smooth physics-based animations**, and **smart positioning** that adapts to the host page.

---

## ✨ Key Features

- **🛡️ Complete Isolation:** Uses Shadow DOM to ensure the widget's styles never conflict with the host website.
- **📍 Smart Positioning:** Powered by `Floating UI`, the widget "magnetically" attaches to target elements and stays visible on scroll/resize.
- **🎨 Smooth Animations:** "Spring" physics transitions using `Framer Motion` for a premium feel.
- **💾 State Persistence:** Remembers the user's progress via LocalStorage (e.g., if they refresh on Step 3, it stays on Step 3).
- **📱 Responsive:** Works on all screen sizes and handles missing target elements gracefully.
- **⚡ Lightweight:** Built with Vite to bundle everything (CSS + JS) into a single, tiny JavaScript file.

---

## 🛠️ Tech Stack

- **Core:** React, TypeScript, Vite
- **Animations:** Framer Motion
- **Positioning:** @floating-ui/dom
- **State Management:** React Hooks + LocalStorage
- **Backend Bridge:** Custom Hook architecture for easy switch between Mock & Real Data

---

## 🚀 Setup & Installation

### 1. Clone & Install
```bash
# Clone the repository
git clone <your-repo-url>

# Enter the directory
cd embed-widget

# Install dependencies
npm install
````

### 2\. Run in Development Mode

This starts a local server with Hot Module Replacement (HMR).

```bash
npm run dev
```

### 3\. Build for Production

This compiles the code into a single embeddable script.

```bash
npm run build
```

*Output Location:* `dist/embed.js`

-----

## 🔗 Team Integration (Connecting the Backend)

Currently, the widget runs in **Mock Mode** so the frontend team can work independently of the backend.

### How to Switch to Real Data (Convex)

When the backend schema (`tours` and `steps` tables) is ready:

1.  Open `src/useTourData.ts`.
2.  Uncomment the **Convex imports** and the **Query logic**.
3.  Comment out the Mock Data lines.
4.  Ensure your `.env.local` contains the correct `VITE_CONVEX_URL`.

The widget is already configured to accept a `tourId` prop and pass it to this hook.

-----

## 📦 How to Embed (For End Users)

To use this widget on a client's website, simply include the script tag with a specific `data-tour-id`.

```html
<script 
  src="./path/to/embed.js" 
  data-tour-id="tour_123_abc"
></script>
```

-----

## 📂 Project Structure

```text
embed-widget/
├── src/
│   ├── App.tsx          # Main UI Logic (Animations, Navigation, Floating UI)
│   ├── main.tsx         # Entry point (Shadow DOM Setup & Script Tag Parsing)
│   ├── useTourData.ts   # The "Bridge" hook (Switches between Mock/Real data)
│   └── mockData.ts      # Temporary data for development
├── vite.config.ts       # Configured to emit a single 'iife' bundle
└── README.md            # You are here
```

-----

## ✅ Acceptance Criteria Checklist

  - [x] Minimum of 5 steps supported.
  - [x] Unique ID per step.
  - [x] Next / Back / Skip / Finish controls.
  - [x] Progress indicator (Visual bar).
  - [x] Resume capability (LocalStorage).
  - [x] Smooth transitions (Framer Motion).

<!-- end list -->

```
```