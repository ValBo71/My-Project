import functools, http.server, urllib.request, webbrowser
from pathlib import Path
PORT=18765
URL=f"http://127.0.0.1:{PORT}"
MARKER=b"spine-creep-calculator-v1"
class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path=='/__health':
            self.send_response(200); self.end_headers(); self.wfile.write(MARKER)
        else: super().do_GET()
    def list_directory(self,path): self.send_error(403)
def main():
    handler=functools.partial(Handler,directory=str(Path(__file__).parent))
    try: server=http.server.ThreadingHTTPServer(('127.0.0.1',PORT),handler)
    except OSError:
        try:
            with urllib.request.urlopen(URL+'/__health',timeout=2) as response:
                if response.read()!=MARKER: raise RuntimeError()
            webbrowser.open(URL); return
        except Exception:
            input('Port 18765 is occupied. Close the other application and retry. Press Enter.'); return
    print('Spine and Creep Calculator: '+URL+' — close this window to stop.',flush=True)
    webbrowser.open(URL)
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.server_close()
if __name__=='__main__': main()
