# IMDB Play Button

A Chrome extension that adds a **▶ Play** button to any IMDB movie or TV series page. Click it and the title starts streaming in a new tab — no account, no login.

---

## Installation

Chrome doesn't allow installing extensions from outside its Web Store, but loading one manually takes under a minute.

### Step 1 — Download

Click the green **Code** button at the top of this page → **Download ZIP**, then unzip the folder anywhere on your computer.

Or with Git:
```
git clone https://github.com/YOUR_USERNAME/imdb-play-extension.git
```

### Step 2 — Open Chrome Extensions

Paste this into your Chrome address bar and hit Enter:
```
chrome://extensions
```

### Step 3 — Enable Developer Mode

Toggle **Developer mode** on in the top-right corner.

### Step 4 — Load the extension

Click **Load unpacked** → select the `imdb-play-extension` folder you downloaded.

Done. The extension is now active.

---

## How to use

1. Go to any movie or TV show on IMDB, e.g. `https://www.imdb.com/title/tt5950044/`
2. A yellow **▶ Play Movie** (or **▶ Play Series**) button appears on the right side of the page
3. Click it — the stream opens in a new tab

---

## Features

- Works on movies and TV series
- Automatically detects movie vs. series from the page
- Blocks pop-up ads on the streaming page
- No account or login required
- No data collected, no tracking

---

## Updating

When a new version is released, replace the folder contents with the new files and click the **↺ refresh icon** on the extension card at `chrome://extensions`.
