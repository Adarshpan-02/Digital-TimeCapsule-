# TimeCapsule — Preserve Your Memories

Live demo: https://digital-timecapsule-box.netlify.app

A lightweight, client-side Time Capsule web app that lets you seal messages to open at a future date. The app is static (HTML/CSS/JavaScript), runs entirely in the browser, and stores capsules locally.

---

## Features

- Create a time capsule with: type (personal, family, community, legacy or custom), title, long message, unlock date or preset duration, optional predictions, optional password protection, and optional recipient email.
- Save capsules locally in the browser (no backend required).
- View a grid of saved capsules and open them after the unlock date.
- Friendly capsule open/close animations and visual loaders.
- Modal preview for opened capsules and simple notifications.

---

## Live Preview

Visit the hosted demo: https://digital-timecapsule-box.netlify.app

---

## Quick Start

No build tools are required — this is a static site.

1. Clone the repository:

   git clone https://github.com/Adarshpan-02/Digital-TimeCapsule-.git

2. Open index.html directly in your browser, or serve it locally for best results:

 

## Project Structure

- index.html — Main markup and UI structure (forms, loaders, modal).
- style.css — Styles, layout, animations.
- script.js — App logic: DOM handling, validation, localStorage persistence, loaders, modal rendering and password checks.

---

## How it Works (Workflow)

1. Create a capsule: choo se a type or enter a custom type, add a title and message, select an unlock date or duration and optionally add a password, predictions or email.
2. Seal the capsule: createCapsule() validates inputs, shows a sealing animation, and persists the capsule to localStorage.
3. View capsules: the My Capsules view shows saved capsules and the count.
4. Open capsule: when the unlock date is reached the app allows opening the capsule — if password-protected the correct password must be entered. The opening animation and modal display the stored content.

---

## Data Model (inferred)

Capsules are stored as JSON objects in localStorage. A typical capsule contains:

- id — unique identifier (timestamp or UUID)
- type — chosen type or custom type
- title — capsule title
- message — main message content
- predictions — optional predictions text
- unlockDate — ISO date string specifying when the capsule can be opened
- createdAt — timestamp when capsule was created
- password — (optional) password data (see Security below)
- recipientEmail — optional email string

Note: Check script.js for exact key names and storage structure.

---

## Security & Privacy Notes

- This app stores data locally in the browser. Capsules will only exist on the device and browser where they were created unless you add export/import or server-side sync.
- Password handling in a purely client-side app may be insecure if stored in plain text. If you rely on password protection, do not store highly sensitive secrets.
- For stronger security, consider using the Web Crypto API to encrypt capsule payloads before saving, or implement a server-side storage solution that encrypts data at rest.

Recommendations:
- Salt and hash passwords before storing, or better yet, avoid storing passwords and use client-side encryption with a passphrase that is not persisted.
- Add an export/import (JSON) feature so users can back up capsules.

---

## Development & Contribution

Contributions and improvements are welcome. Suggested workflow:

1. Fork the repository.
2. Create a feature branch: feature/your-change.
3. Implement changes and test locally.
4. Open a Pull Request against main with a clear description.

Ideas for improvements:
- Add encrypted export/import of capsules.
- Implement secure password hashing or client-side encryption (Web Crypto).
- Add cloud sync with user authentication (optional).
- Split script.js into modules and add unit tests.

---

## Testing Tips

- Use the "Today (for testing)" duration option to create capsules that unlock immediately for testing open/unlock flows.
- Inspect saved capsules in DevTools: Application → Local Storage to see stored JSON objects.

---

 
## License

This repository is licensed under the MIT License. See the LICENSE file for details.

---

## Author

Adarshpan-02 — https://github.com/Adarshpan-02

If you want, I can also: add export/import code, implement client-side encryption examples, or split script.js and open a PR with the changes.
