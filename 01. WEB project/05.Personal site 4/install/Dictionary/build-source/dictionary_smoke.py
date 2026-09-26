from pathlib import Path
import os, sys, threading, tempfile, functools, zipfile, json
build = Path(os.environ['TEMP'])/'dictionary-build'
sys.path.insert(0,str(build/'test-app'))
import desktop
server = desktop.http.server.ThreadingHTTPServer(('127.0.0.1',18763),functools.partial(desktop.Handler,directory=str(build/'test-app')))
threading.Thread(target=server.serve_forever,daemon=True).start()
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    profile = tempfile.mkdtemp(prefix='dictionary-profile-')
    browser = p.chromium.launch_persistent_context(profile,headless=True)
    page = browser.new_page()
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.goto(desktop.URL,wait_until='domcontentloaded')
    page.wait_for_function('typeof db !== "undefined" && db !== null')
    assert page.evaluate('getAllWordsFromDB().then(x=>x.length)') == 0
    assert page.evaluate('window.isSecureContext')
    assert page.locator('a[download][href$=".xlsx"]').count() == 8
    for link in page.locator('a[download][href$=".xlsx"]').all():
        assert page.request.get(desktop.URL+'/'+link.get_attribute('href')).status == 200
    page.evaluate('addWordToDB({word:"test",translation:"тест",language:"en",status:"new",sourceFile:"Smoke"})')
    browser.close()
    browser = p.chromium.launch_persistent_context(profile,headless=True)
    page=browser.new_page()
    page.goto(desktop.URL,wait_until='domcontentloaded')
    page.wait_for_function('typeof db !== "undefined" && db !== null')
    assert page.evaluate('getAllWordsFromDB().then(x=>x.length)') == 1
    browser.close()
    assert not errors, errors
server.shutdown()
server.server_close()
with zipfile.ZipFile(build/'output/payload.zip') as z:
    assert not any(n.endswith(('.db','.sqlite','.log')) for n in z.namelist())
print('PASS: empty IndexedDB, persistent progress, secure context, 8 downloadable dictionaries, no JS errors')
