"""Builds the Car Maintenance release packages and the small download installers.

    python build.py --tag carmaintenance-v1.1.0 [--out dist]

Run on Windows (the installer EXE is compiled with the .NET Framework csc.exe). The
GitHub Actions workflow .github/workflows/carmaintenance-release.yml runs it for every
carmaintenance-v* tag and uploads everything in --out to the GitHub Release of that tag.

1. Copies the git-tracked project files (no local database, uploads, bin/obj) to a temp folder.
2. Turns the copy into the installer variant: installer.Program.cs replaces the Web
   Program.cs (SQLite in the user's data folder), SQL Server becomes SQLite, and the sample
   data (DbInitializer seed, its car image, the LocalDB connection string) is removed.
3. Runs the unit tests and publishes self-contained builds for win-x64, osx-x64, osx-arm64.
4. Release assets (--out):
     CarMaintenance-win-x64.zip, CarMaintenance-osx-x64.zip, CarMaintenance-osx-arm64.zip
         the app packages the installers download
     CarMaintenance-Windows-Setup.exe, CarMaintenance-macOS-Install.zip
         small installers with the release URL and SHA-256 of their package built in
     SHA256SUMS.txt
"""
from pathlib import Path
import argparse, hashlib, json, os, shutil, subprocess, tempfile, zipfile

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
REPO_URL = 'https://github.com/ValBo71/My-Project'
CSC = r'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'
RIDS = ('win-x64', 'osx-x64', 'osx-arm64')
SQLSERVER = '<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="9.0.*" />'
SQLITE = '<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="9.0.*" />'
ZIP_DATE = (1980, 1, 1, 0, 0, 0)

parser = argparse.ArgumentParser()
parser.add_argument('--tag', required=True, help='release tag, e.g. carmaintenance-v1.1.0')
parser.add_argument('--out', default=str(PROJECT / 'dist'))
args = parser.parse_args()
assert args.tag.startswith('carmaintenance-v'), args.tag
OUT = Path(args.out).resolve()
WORK = Path(tempfile.mkdtemp(prefix='carmaint-'))
SRC = WORK / 'src'


def run(*cmd, cwd=None):
    print('>', ' '.join(map(str, cmd)), flush=True)
    subprocess.run(cmd, cwd=cwd, check=True)


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


shutil.rmtree(OUT, ignore_errors=True)
OUT.mkdir(parents=True)

# 1. tracked files only
tracked = subprocess.run(['git', '-C', str(PROJECT), 'ls-files', '-z', '--', '.'], check=True,
                         capture_output=True).stdout.decode('utf-8').split('\0')
for rel in filter(None, tracked):
    if rel.startswith('installer/'):
        continue
    dst = SRC / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(PROJECT / rel, dst)

# 2. installer variant
shutil.copyfile(HERE / 'installer.Program.cs', SRC / 'CarMaintenance.Web' / 'Program.cs')
for csproj in (SRC / 'CarMaintenance.Web' / 'CarMaintenance.Web.csproj',
               SRC / 'CarMaintenance.Infrastructure' / 'CarMaintenance.Infrastructure.csproj'):
    text = csproj.read_text(encoding='utf-8-sig')
    assert SQLSERVER in text, csproj
    csproj.write_text(text.replace(SQLSERVER, SQLITE), encoding='utf-8')
(SRC / 'CarMaintenance.Infrastructure' / 'Data' / 'DbInitializer.cs').unlink()
(SRC / 'CarMaintenance.Web' / 'wwwroot' / 'images' / 'saab_95.png').unlink()
appsettings = SRC / 'CarMaintenance.Web' / 'appsettings.json'
settings = json.loads(appsettings.read_text(encoding='utf-8-sig'))
settings.pop('ConnectionStrings', None)
appsettings.write_text(json.dumps(settings, indent=2) + '\n', encoding='utf-8')

# 3. tests + publish
run('dotnet', 'test', str(SRC / 'CarMaintenance.Tests'), '-c', 'Release', '--nologo')
for rid in RIDS:
    run('dotnet', 'publish', str(SRC / 'CarMaintenance.Web'), '-c', 'Release', '-r', rid,
        '--self-contained', 'true', '-p:DebugType=none', '-o', str(WORK / 'publish' / rid), '--nologo')


def check_payload(root, rel):
    bad = [r for r in rel if r.endswith(('.db', '.db-wal', '.db-shm', '.pdb', 'saab_95.png')) or '/uploads/' in '/' + r]
    assert not bad, bad
    assert 'e_sqlite3' in ' '.join(rel) and not any('SqlClient' in r for r in rel), root
    # no sample records (the car form's placeholder hint "напр. Citroën" in Web.dll is not a record)
    checks = {'CarMaintenance.Infrastructure.dll': ('Citroën', 'Saab', 'DbInitializer'),
              'CarMaintenance.Web.dll': ('DbInitializer', 'mssqllocaldb'),
              'appsettings.json': ('mssqllocaldb', 'ConnectionStrings')}
    for name, markers in checks.items():
        data = (root / name).read_bytes()
        for marker in markers:
            assert marker.encode('utf-16le') not in data and marker.encode('utf-8') not in data, (root, name, marker)


def add(z, name, data, executable=False):
    info = zipfile.ZipInfo(name, date_time=ZIP_DATE)
    info.create_system = 3
    info.external_attr = (0o100755 if executable else 0o100644) << 16
    info.compress_type = zipfile.ZIP_DEFLATED  # a bare ZipInfo would be stored uncompressed
    z.writestr(info, data)


# 4a. app packages
packages = {}
for rid in RIDS:
    root = WORK / 'publish' / rid
    files = sorted(p for p in root.rglob('*') if p.is_file())
    rel = [p.relative_to(root).as_posix() for p in files]
    check_payload(root, rel)
    name = f'CarMaintenance-{rid}.zip'
    with zipfile.ZipFile(OUT / name, 'w', zipfile.ZIP_DEFLATED) as z:
        for f, r in zip(files, rel):
            add(z, r, f.read_bytes(), executable=(r == 'CarMaintenance.Web'))
    packages[rid] = (f'{REPO_URL}/releases/download/{args.tag}/{name}', sha256(OUT / name))


def fill(text, values):
    for key, value in values.items():
        text = text.replace(key, value)
    assert '__' not in text.replace('__PLACEHOLDERS__', ''), 'unfilled placeholder'
    return text


# 4b. Windows installer
build = WORK / 'setup'
build.mkdir()
url, digest = packages['win-x64']
(build / 'setup.cs').write_text(fill((HERE / 'setup.template.cs').read_text(encoding='utf-8'),
                                     {'__TAG__': args.tag, '__URL__': url, '__SHA256__': digest}), encoding='utf-8')
shutil.copyfile(HERE / 'app.ico', build / 'app.ico')
run(CSC, '-nologo', '-target:exe', '-optimize+', '-win32icon:app.ico',
    '-r:System.IO.Compression.dll', '-r:System.IO.Compression.FileSystem.dll', '-r:Microsoft.CSharp.dll', '-r:System.Core.dll',
    '-out:CarMaintenance-Windows-Setup.exe', 'setup.cs', cwd=build)
shutil.copyfile(build / 'CarMaintenance-Windows-Setup.exe', OUT / 'CarMaintenance-Windows-Setup.exe')

# 4c. macOS installer (the .command keeps its executable bit inside the zip)
command = fill((HERE / 'Install Car Maintenance.template.command').read_text(encoding='utf-8').replace('\r\n', '\n'),
               {'__TAG__': args.tag,
                '__URL_X64__': packages['osx-x64'][0], '__SHA256_X64__': packages['osx-x64'][1],
                '__URL_ARM64__': packages['osx-arm64'][0], '__SHA256_ARM64__': packages['osx-arm64'][1]})
with zipfile.ZipFile(OUT / 'CarMaintenance-macOS-Install.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    add(z, 'Install Car Maintenance.command', command.encode('utf-8'), executable=True)

# 5. checksums
names = sorted(p.name for p in OUT.iterdir())
# LF line endings even on Windows (write_text would write CRLF, which sha256sum -c rejects)
(OUT / 'SHA256SUMS.txt').write_bytes(''.join(f'{sha256(OUT / n)}  {n}\n' for n in names).encode('utf-8'))

shutil.rmtree(WORK, ignore_errors=True)
print(OUT)
for n in names + ['SHA256SUMS.txt']:
    print(f'  {n}  {(OUT / n).stat().st_size:,} B')
