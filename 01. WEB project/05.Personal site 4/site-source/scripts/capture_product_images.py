from __future__ import annotations

import os
import shutil
import socket
import sys
import tempfile
import threading
import types
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright
from werkzeug.serving import make_server


ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "public" / "images"
DICTIONARY = Path(r"E:\Programing\My_project\GitHub\MyProject\09. Other tools\03.Dictionary")
SPINE = Path(r"E:\Programing\My_project\GitHub\MyProject\09. Other tools\02.Printing\01.Spine and Creep Calculator")
CATALOG = Path(r"E:\Programing\My_project\GitHub\MyProject\09. Other tools\02.Printing\03.Catalog")
OBSERVER = Path(r"E:\Programing\My_project\GitHub\MyProject\08.Observer\02.ObserverV2")


def free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


@contextmanager
def static_site(directory: Path):
    port = free_port()
    handler = partial(SimpleHTTPRequestHandler, directory=str(directory))
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{port}"
    finally:
        server.shutdown()


@contextmanager
def flask_site(source: Path, kind: str):
    temp = Path(tempfile.mkdtemp(prefix=f"valbo-{kind}-"))
    old_cwd = Path.cwd()
    old_path = list(sys.path)
    copied_modules: list[str] = []
    try:
        for item in source.iterdir():
            if item.name in {".venv", ".git", "__pycache__", "database", "uploads", "jobs.db", "app.log", "linkedin_session.json", "linkedin_credentials.json"}:
                continue
            target = temp / item.name
            if item.is_dir():
                shutil.copytree(item, target)
            elif item.suffix in {".py", ".md", ".txt"}:
                shutil.copy2(item, target)

        os.chdir(temp)
        sys.path.insert(0, str(temp))
        for name in ("app", "config", "database", "scraper", "parser"):
            if name in sys.modules:
                copied_modules.append(name)
                del sys.modules[name]
        if kind == "catalog":
            os.environ["CATALOG_ADMIN_PASSWORD"] = "admin"
            # Preview capture never uploads or renders PDF files. A small stub keeps
            # the optional renderer from becoming a requirement for this script.
            sys.modules["pymupdf"] = types.ModuleType("pymupdf")
        module = __import__("app")
        if kind == "catalog":
            module.init_db()
        if kind == "observer":
            module.perform_refresh_cycle = lambda: (True, "", 0)
        port = free_port()
        server = make_server("127.0.0.1", port, module.app)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            yield f"http://127.0.0.1:{port}"
        finally:
            server.shutdown()
    finally:
        os.chdir(old_cwd)
        sys.path[:] = old_path
        for name in ("app", "config", "database", "scraper", "parser"):
            sys.modules.pop(name, None)
        sys.modules.pop("pymupdf", None)
        shutil.rmtree(temp, ignore_errors=True)


def shot(page, url: str, filename: str) -> None:
    page.goto(url, wait_until="networkidle")
    page.evaluate("window.scrollTo(0, 0)")
    page.screenshot(path=IMAGES / filename, full_page=False)


def main() -> None:
    IMAGES.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)

        with static_site(DICTIONARY) as url:
            shot(page, url, "dictionary.png")
            page.click("#nav-btn-exam")
            page.screenshot(path=IMAGES / "dictionary-exam.png", full_page=False)
        with static_site(SPINE) as url:
            shot(page, url, "spine-creep.png")
            page.get_by_text("Твърда корица", exact=True).click()
            page.screenshot(path=IMAGES / "spine-hardcover.png", full_page=False)
        with flask_site(CATALOG, "catalog") as url:
            page.goto(url + "/login", wait_until="networkidle")
            page.screenshot(path=IMAGES / "printing-catalog-login.png", full_page=False)
            page.fill("#username", "admin")
            page.fill("#password", "admin")
            page.click("button[type=submit]")
            page.wait_for_load_state("networkidle")
            page.screenshot(path=IMAGES / "printing-catalog.png", full_page=False)
        with flask_site(OBSERVER, "observer") as url:
            shot(page, url, "observer.png")
            page.locator('[data-tab="settings-tab"]').click()
            page.screenshot(path=IMAGES / "observer-settings.png", full_page=False)

        browser.close()
    print("Captured Dictionary, Spine & Creep, Printing Catalog, and Observer V2")


if __name__ == "__main__":
    main()
