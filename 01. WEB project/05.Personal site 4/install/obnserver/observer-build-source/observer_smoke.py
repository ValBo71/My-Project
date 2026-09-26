import os, sys, tempfile, threading, urllib.request
from pathlib import Path
build = Path(os.environ['TEMP'])/'observer-build'
sys.path.insert(0, str(build/'test-app'))
import config
data = Path(tempfile.mkdtemp(prefix='observer-test-'))
config.DATABASE_PATH = str(data/'jobs.db')
config.LINKEDIN_SESSION_PATH = str(data/'session.json')
import app
app.perform_refresh_cycle = lambda: (True, '', 0)
from waitress import create_server
server = create_server(app.app, host='127.0.0.1', port=0)
threading.Thread(target=server.run, daemon=True).start()
url = 'http://127.0.0.1:'+str(server.effective_port)
with urllib.request.urlopen(url) as r:
    assert r.status == 200 and b'<html' in r.read().lower()
with urllib.request.urlopen(url+'/static/css/styles.css') as r: assert r.status == 200
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(url)
    assert page.locator('body').inner_text().strip()
    browser.close()
server.close()
print('PASS: fresh database, HTTP dashboard, static CSS, Chromium render')
