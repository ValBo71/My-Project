import os, sys, threading, webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
# User data (database, uploads, secret key) lives outside the program files,
# so reinstalling keeps it: %LOCALAPPDATA%\PrintingCatalog\data or
# ~/Library/Application Support/PrintingCatalog/data
DATA = Path(os.environ.get('LOCALAPPDATA', str(Path.home() / 'Library/Application Support'))) / 'PrintingCatalog' / 'data'
DATA.mkdir(parents=True, exist_ok=True)
os.chdir(DATA)
sys.path.insert(0, str(ROOT))

import app  # creates/migrates the database on import; a fresh one gets admin / admin
from waitress import create_server

if app.BOOTSTRAP_PASSWORD:
    print("\nNEW ADMIN ACCOUNT\nUsername: admin\nPassword: " + app.BOOTSTRAP_PASSWORD +
          "\nChange it from 'My account' after the first login.\n", flush=True)
try:
    server = create_server(app.app, host='0.0.0.0', port=5050, threads=6)
except OSError:
    input('Port 5050 is occupied. Close the other application and retry. Press Enter.')
    raise SystemExit(1)
print('Printing Catalog: http://127.0.0.1:5050 - close this window to stop.', flush=True)
threading.Timer(1, lambda: webbrowser.open('http://127.0.0.1:5050')).start()
try:
    server.run()
except KeyboardInterrupt:
    pass
finally:
    server.close()
