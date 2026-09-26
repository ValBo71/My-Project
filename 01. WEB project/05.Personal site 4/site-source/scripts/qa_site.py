import os
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get("VALBO_SITE_URL", "http://localhost:3000")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    desktop = browser.new_page(viewport={"width": 1440, "height": 1000})
    desktop.goto(URL, wait_until="networkidle")
    assert desktop.locator(".product-card").count() == 6
    # Printing Catalog card shows the first login: user "admin" and password "admin"
    credentials = desktop.get_by_text("admin", exact=True)
    assert credentials.count() == 2 and all(credentials.nth(i).is_visible() for i in range(2))
    assert desktop.locator('.manual-link').count() == 6
    assert all(link.endswith('-bg.pdf') for link in desktop.locator('.manual-link').evaluate_all("links => links.map(link => link.href)"))
    # Product images load lazily: bring each one into view before checking that it loaded
    for image in desktop.locator(".product-visual img").all():
        image.scroll_into_view_if_needed()
    desktop.wait_for_load_state("networkidle")
    assert desktop.locator("img").evaluate_all("imgs => imgs.every(img => img.complete && img.naturalWidth > 0)")
    desktop.evaluate("window.scrollTo(0, 0)")

    desktop.locator('.details-link').first.click()
    dialog = desktop.locator('.product-dialog')
    assert dialog.is_visible()
    assert dialog.get_by_text('Observer V2', exact=True).is_visible()
    assert dialog.locator('.gallery-thumbs button').count() >= 2
    first_caption = dialog.locator('.image-caption strong').inner_text()
    dialog.locator('.gallery-arrow.next').click()
    assert dialog.locator('.image-caption strong').inner_text() != first_caption
    desktop.keyboard.press('ArrowLeft')
    assert dialog.locator('.image-caption strong').inner_text() == first_caption
    desktop.keyboard.press('Escape')
    assert not dialog.is_visible()

    for link in desktop.locator(".platform-button").evaluate_all("links => links.map(link => link.href)"):
        response = desktop.request.head(link)
        assert response.ok, f"Broken download link: {link} ({response.status})"

    desktop.get_by_role('button', name='EN', exact=True).click()
    assert desktop.locator('html').get_attribute('lang') == 'en'
    assert 'Tools for' in desktop.locator('h1').inner_text()
    manual_links = desktop.locator('.manual-link').evaluate_all("links => links.map(link => link.href)")
    assert len(manual_links) == 6 and all(link.endswith('-en.pdf') for link in manual_links)
    for link in manual_links:
        response = desktop.request.get(link)
        assert response.ok and response.body().startswith(b'%PDF'), f"Broken manual: {link}"
    desktop.get_by_role('button', name='BG', exact=True).click()

    desktop.get_by_role("button", name="Печат").click()
    assert desktop.locator(".product-card").count() == 3
    desktop.get_by_role("button", name="Всички").click()
    desktop.get_by_placeholder("Търсене на продукт…").fill("dictionary")
    assert desktop.locator(".product-card").count() == 1
    desktop.get_by_placeholder("Търсене на продукт…").fill("")
    desktop.screenshot(path=ROOT / "preview-desktop.png", full_page=True)

    mobile = browser.new_page(viewport={"width": 390, "height": 844})
    mobile.goto(URL, wait_until="networkidle")
    assert mobile.locator(".product-card").count() == 6
    assert mobile.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    mobile.screenshot(path=ROOT / "preview-mobile.png", full_page=False)
    browser.close()

print("QA passed: bilingual UI, 6 localized manuals, 12 downloads, product details, gallery controls, filters, credentials, images, and mobile width")
