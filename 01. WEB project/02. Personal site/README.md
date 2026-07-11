# Valentin Bogdanov - Personal Portfolio Website

A responsive, single-page personal portfolio website showcasing the professional profile, skills, work experience, and projects of **Valentin Bogdanov**, an Automation QA Specialist based in Sofia, Bulgaria.

---

## 📂 Project Structure

```text
02. Personal site/
├── index.html                   # Main entry point of the portfolio website
├── css/                         # Stylesheets
│   ├── bootstrap.min.css        # Bootstrap layout system
│   ├── font-awesome.min.css     # Font Awesome vector icons
│   ├── isotope.css              # Styling for filterable portfolio items
│   ├── da-slider.css            # Carousel slider styles
│   └── styles.css               # Main custom design rules
├── js/                          # JavaScript scripts & plugins
│   ├── jquery-1.8.2.min.js      # Core jQuery library
│   ├── bootstrap.min.js         # Bootstrap UI components
│   ├── jquery.isotope.min.js    # Filter and masonry grid layout engine
│   ├── jquery.diagram.js        # Custom plugin for radial progress charts
│   ├── jquery.nav.js            # One-page navigation scroll spy
│   ├── jquery.cslider.js        # Responsive content slider
│   ├── modernizr-latest.js      # Browser feature detection
│   └── custom.js                # Main script initializing slider, diagrams, and filters
├── images/                      # Media assets (profile photo, banner, thumbnails, and downloadable CV PDF)
└── contact/                     # Contact form helper scripts
    ├── jqBootstrapValidation.js # Form validation library
    └── contact_me.js            # AJAX-based contact form handler
```

---

## 💡 Key Features

1. **Smooth Single-Page Navigation**: Implemented using the `jquery.nav.js` plugin with automatic header styling changes (`addBg` class) on scroll.
2. **Dynamic Skill Visualization**:
   - **Radial Diagrams**: Implements `jquery.diagram.js` to draw SVG circles depicting proficiency in Quality Assurance (70%), UI and API Testing (50%), and Performance Testing (30%).
   - **Progress Bars**: CSS-based progress bars illustrating familiarity with C#, JavaScript, Java, SQL, Selenium, Playwright, and AI.
3. **Interactive Portfolio Filtering**: Powered by `isotope.js` and categorized to let visitors filter between "QA Automation Project", "Printing Product", and "Other Project".
4. **Portfolio Links**: Each project tile opens its corresponding GitHub repository (or live project) in a new tab.
5. **Working Contact Form**: Client-side validation via Bootstrap, with submissions delivered by email through the Web3Forms API (no backend required).

---

## 🛠️ Tech Stack

* **Structure**: HTML5
* **Styling**: CSS3 (Bootstrap v3 base, Font Awesome v4, Custom responsive rules)
* **Logic & Animation**: JavaScript (ES5/ES6, jQuery v1.8.2)

---

## 🚀 How to Run Locally

Since this is a client-side static web application, no compilation or database setup is required. 

1. **Directly in Browser**:
   Open `index.html` inside the `02. Personal site` directory using any modern web browser.

2. **Via Local Server** (Recommended for checking relative paths and scripts):
   If you have Python installed, you can spin up a quick server in the project folder:
   ```bash
   python -m http.server 8000
   ```
   Then navigate to [http://localhost:8000](http://localhost:8000).
