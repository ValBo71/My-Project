# 🕷️ Bug Hunters (Buddy Group 1) - Web Portal

Welcome to the official web portal of **Bug Hunters** (First Buddy Group), created by students of the **A28 QA Automation group at Telerik Academy**.

This is a fully responsive, multilingual, interactive portfolio website that showcases the profiles, personality types, backgrounds, and hobbies of our team members.

---

## 👥 Team Members & Profiles

The page features 6 group members, each with unique backgrounds and roles:

1. **Antoniya Petrova (Toni)** — *Guardian* (Conscientious, precise, and disciplined).
2. **Elena Matuska (Eli)** — *Altruist* (Thoughtful, collaborative, and friendly).
3. **Nataliya Todorova (Nati)** — *Collaborator* (Warm, patient, and socially focused).
4. **Nikolay Rusanov (Niki)** — *Specialist* (Quiet, unselfish, and goal-driven).
5. **Valentin Markov (Valyo)** — *Guardian* (Tactical, structured planner, and detail-oriented).
6. **Valentin Bogdanov (Valbo)** — *Persuader* (Enthusiastic communicator, ambitious, and decision-maker).

---

## 🌟 Key Features

* **3D Card Flip Animation**: Hover or click on any member's photo on the home page to flip their card and view their personality profile (Predictive Index).
* **Dual-Language Support**: Complete Bulgarian (BG) and English (ENG) localizations for all pages and navigation links.
* **Interactive Hobbies & Sub-hobbies**:
  * **Valentin Markov (Valyo)**: Features galleries and detailed guides for *Cooking* (bread, cheesecake, Rollo Stephanie, peanut cookies), *Drone Flying* (with aerial videos and cinematic guides), and *Hiking*.
  * **Elena Matuska (Eli)**: Focuses on *Cooking* and other personal interests.
  * **Nikolay Rusanov (Niki)**: Showcases climbing and nature interests.
  * **Antoniya Petrova (Toni)**: Explores folklore dancing and outdoor activities.
  * **Nataliya Todorova (Nati)**: Explores skiing, hiking, and travel.
  * **Valentin Bogdanov (Valbo)**: Shares passion for carpentry, shooting, and Krav Maga.
* **Responsive Layouts**: Designed using modern CSS Grid and Flexbox to automatically adjust to desktop, tablet, and mobile screen sizes.

---

## 📂 Project Structure

```directory
01. WebPage/
│
├── index.html                  # English Main Page
├── indexBG.html                # Bulgarian Main Page
│
├── about_*.html                # English "About Me" pages for each member
├── aboutbg_*.html              # Bulgarian "About Me" pages (Valbo)
├── about_*_bg.html             # Bulgarian "About Me" pages (Others)
│
├── hobbies_*.html              # English "My Hobbies" hub pages
├── hobbiesbg_*.html            # Bulgarian "My Hobbies" hub page (Valbo)
├── hobbies_*_bg.html           # Bulgarian "My Hobbies" hub pages (Others)
│
├── cooking_valyo.html          # Valentin Markov's cooking hobby sub-page
├── bread_valyo.html            # Recipe sub-page (Bread)
├── cheesecake_valyo.html      # Recipe sub-page (Cheesecake)
├── peanut_cookie.html          # Recipe sub-page (Peanut Cookies)
├── stefani.html                # Recipe sub-page (Rollo Stephanie)
│
├── drone_valyo.html            # Valentin Markov's drone flying hobby sub-page
├── flyingrobot_valyo.html      # Information sub-page (Drone details)
├── dropdown_video.html         # Custom dropdown media gallery for videos
│
├── css/                        # Style Sheets
│   ├── style.css               # Main page layout & responsive rules
│   ├── about.css               # Base stylesheet for member profiles
│   ├── hobbiesbig.css          # Stylesheet for detailed hobby pages
│   └── css_valyo/              # Valentin Markov's custom gallery styles
│
├── js/                         # Script Files
│   ├── index.js                # Footer menu behaviors
│   ├── flip.js                 # 3D card flip animation toggle
│   ├── dropdown.js             # Dropdown toggles
│   └── js_valmar/              # Custom image expand & video scripts
│
└── img/                        # Assets (photos, flags, icons, SVGs)
```

---

## 🛠️ Technologies Used

1. **HTML5**: Structured semantic pages.
2. **Vanilla CSS3**: Layout transitions, 3D card rotations, drop shadow effects, absolute/relative positioning, and media queries for responsive adjustments.
3. **JavaScript (ES6) / jQuery**: Event handlers for hover animations, slideshow controls, custom modal dialog video expansion, and dropdown navigations.

---

## 🚀 How to Run Locally

Since this is a client-side static web application, you do not need a backend server:
1. Open the project folder.
2. Double-click on `index.html` (for English) or `indexBG.html` (for Bulgarian) to open it in your web browser.
3. Simply navigate through the pages by clicking the interactive links or member cards.
