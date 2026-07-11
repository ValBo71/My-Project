import os
import sqlite3
import socket
import secrets
import time
import logging
from functools import wraps
from flask import Flask, request, jsonify, render_template, send_from_directory, session, redirect, url_for
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurations
UPLOAD_FOLDER = 'uploads'
DB_FOLDER = 'database'
DB_PATH = os.path.join(DB_FOLDER, 'catalog.db')
SECRET_KEY_FILE = os.path.join(DB_FOLDER, '.flask_secret_key')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'svg'}

ROLE_ADMIN = 'admin'
ROLE_READ_WRITE = 'read_write'
ROLE_READ_ONLY = 'read_only'
ROLES = (ROLE_ADMIN, ROLE_READ_WRITE, ROLE_READ_ONLY)
ROLE_LABELS = {ROLE_ADMIN: 'Администратор', ROLE_READ_WRITE: 'Редактиране', ROLE_READ_ONLY: 'Само преглед'}

PUBLIC_PATHS = {'/login', '/logout'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
# Lax SameSite blocks the session cookie from being sent on cross-site requests,
# mitigating CSRF against the write endpoints below (no separate CSRF tokens needed).
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DB_FOLDER, exist_ok=True)

def get_or_create_secret_key():
    """Flask session signing key, persisted in the git-ignored database/ folder so
    sessions survive restarts but the key never ends up committed to the repo."""
    if os.path.exists(SECRET_KEY_FILE):
        with open(SECRET_KEY_FILE, 'r', encoding='utf-8') as f:
            saved_key = f.read().strip()
            if saved_key:
                return saved_key

    new_key = secrets.token_hex(32)
    with open(SECRET_KEY_FILE, 'w', encoding='utf-8') as f:
        f.write(new_key)
    return new_key

app.secret_key = get_or_create_secret_key()

@app.before_request
def enforce_login():
    if request.path in PUBLIC_PATHS or request.path.startswith('/static/'):
        return None
    if 'user_id' not in session:
        if request.path.startswith('/api/'):
            return jsonify({'error': 'Не сте влезли в системата.'}), 401
        return redirect(url_for('login_page'))
    return None

def require_role(*allowed_roles):
    """Route decorator restricting access to the given roles; assumes enforce_login
    already guaranteed the user is authenticated."""
    def decorator(view_func):
        @wraps(view_func)
        def wrapped(*args, **kwargs):
            if session.get('role') not in allowed_roles:
                if request.path.startswith('/api/'):
                    return jsonify({'error': 'Нямате права за това действие.'}), 403
                return redirect(url_for('index'))
            return view_func(*args, **kwargs)
        return wrapped
    return decorator

def is_served_directory(candidate_path):
    """True if candidate_path is (or is inside) a folder the app serves publicly
    (uploads/database), which would let a copied file be downloaded by anyone
    without authentication via /uploads/<filename>."""
    try:
        real_candidate = os.path.realpath(candidate_path)
    except (OSError, ValueError):
        return True
    for served_root in (os.path.realpath(UPLOAD_FOLDER), os.path.realpath(DB_FOLDER)):
        if real_candidate == served_root or real_candidate.startswith(served_root + os.sep):
            return True
    return False

def get_local_ip():
    """Returns the local IP address of the machine."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Doesn't need to connect to anything, just triggers local IP routing
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def init_db():
    """Initializes the SQLite database with the tools table."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS tools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            category TEXT NOT NULL,
            name TEXT NOT NULL,
            client TEXT,
            dimensions TEXT,
            location TEXT,
            image_filename TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Run migrations for new columns
    c.execute("PRAGMA table_info(tools)")
    columns = [row[1] for row in c.fetchall()]
    
    if 'die_shape' not in columns:
        c.execute("ALTER TABLE tools ADD COLUMN die_shape TEXT")
    if 'ups' not in columns:
        c.execute("ALTER TABLE tools ADD COLUMN ups INTEGER DEFAULT 1")
    if 'material' not in columns:
        c.execute("ALTER TABLE tools ADD COLUMN material TEXT")
    if 'die_type' not in columns:
        c.execute("ALTER TABLE tools ADD COLUMN die_type TEXT")
    if 'single_item_dimensions' not in columns:
        c.execute("ALTER TABLE tools ADD COLUMN single_item_dimensions TEXT")
    if 'file_path' not in columns:
        c.execute("ALTER TABLE tools ADD COLUMN file_path TEXT")

    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'read_only',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()

    # Bootstrap a default admin account on first run.
    bootstrap_password = None
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] == 0:
        bootstrap_password = os.environ.get('CATALOG_ADMIN_PASSWORD', '').strip() or secrets.token_urlsafe(9)
        c.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
            ('admin', generate_password_hash(bootstrap_password), ROLE_ADMIN)
        )
        conn.commit()

    # Optional recovery path if the admin password is forgotten: set this env var and restart.
    reset_password = os.environ.get('CATALOG_RESET_ADMIN_PASSWORD', '').strip()
    if reset_password:
        c.execute("SELECT id FROM users WHERE role = ? ORDER BY id ASC LIMIT 1", (ROLE_ADMIN,))
        row = c.fetchone()
        if row:
            c.execute("UPDATE users SET password_hash = ? WHERE id = ?", (generate_password_hash(reset_password), row[0]))
            conn.commit()
            logger.info("Admin password was reset via the CATALOG_RESET_ADMIN_PASSWORD env var.")

    conn.close()
    return bootstrap_password

def generate_code(category):
    """Generates a sequential code based on the category (e.g. SH-0001, PR-0001, TP-0001)."""
    prefix = 'SH-' if category == 'die' else ('PR-' if category == 'embossing' else 'TP-')
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT code FROM tools WHERE category=? AND code LIKE ? ORDER BY id DESC", (category, prefix + "%"))
    rows = c.fetchall()
    conn.close()

    max_num = 0
    for row in rows:
        code_str = row[0]
        try:
            num_part = int(code_str.split('-')[1])
            if num_part > max_num:
                max_num = num_part
        except (IndexError, ValueError):
            continue

    next_num = max_num + 1
    return f"{prefix}{next_num:04d}"

def allowed_file(filename):
    """Checks if the file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Home page
@app.route('/')
def index():
    local_ip = get_local_ip()
    return render_template(
        'index.html', local_ip=local_ip,
        username=session.get('username'), role=session.get('role'),
        role_label=ROLE_LABELS.get(session.get('role'), '')
    )

@app.route('/login', methods=['GET', 'POST'])
def login_page():
    if request.method == 'GET':
        if 'user_id' in session:
            return redirect(url_for('index'))
        return render_template('login.html', error=None)

    username = request.form.get('username', '').strip()
    password = request.form.get('password', '')

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT id, username, password_hash, role FROM users WHERE username = ?", (username,))
    user = c.fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return render_template('login.html', error='Грешно потребителско име или парола.'), 401

    session.clear()
    session['user_id'] = user['id']
    session['username'] = user['username']
    session['role'] = user['role']
    return redirect(url_for('index'))

@app.route('/logout', methods=['GET', 'POST'])
def logout():
    session.clear()
    return redirect(url_for('login_page'))

@app.route('/account')
def account_page():
    return render_template(
        'account.html', username=session.get('username'),
        role=session.get('role'), role_label=ROLE_LABELS.get(session.get('role'), '')
    )

@app.route('/admin')
@require_role(ROLE_ADMIN)
def admin_page():
    return render_template('admin.html', username=session.get('username'), role_labels=ROLE_LABELS)

# API: Change my own password (any logged-in role)
@app.route('/api/me/password', methods=['PUT'])
def change_my_password():
    data = request.get_json() or {}
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not new_password or len(new_password) < 4:
        return jsonify({'error': 'Новата парола трябва да е поне 4 символа.'}), 400

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT password_hash FROM users WHERE id = ?", (session['user_id'],))
    row = c.fetchone()

    if not row or not check_password_hash(row['password_hash'], current_password):
        conn.close()
        return jsonify({'error': 'Текущата парола е грешна.'}), 400

    c.execute("UPDATE users SET password_hash = ? WHERE id = ?", (generate_password_hash(new_password), session['user_id']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# API: List users (admin only)
@app.route('/api/users', methods=['GET'])
@require_role(ROLE_ADMIN)
def list_users():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT id, username, role, created_at FROM users ORDER BY id ASC")
    users = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify(users)

# API: Create user (admin only)
@app.route('/api/users', methods=['POST'])
@require_role(ROLE_ADMIN)
def create_user():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')
    role = data.get('role', '').strip()

    if not username or not password:
        return jsonify({'error': 'Моля попълнете потребителско име и парола.'}), 400
    if len(password) < 4:
        return jsonify({'error': 'Паролата трябва да е поне 4 символа.'}), 400
    if role not in ROLES:
        return jsonify({'error': 'Невалидна роля.'}), 400

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE username = ?", (username,))
    if c.fetchone():
        conn.close()
        return jsonify({'error': f'Потребител "{username}" вече съществува.'}), 400

    c.execute(
        "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
        (username, generate_password_hash(password), role)
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# API: Update a user's role and/or reset their password (admin only)
@app.route('/api/users/<int:user_id>', methods=['PUT'])
@require_role(ROLE_ADMIN)
def update_user(user_id):
    data = request.get_json() or {}
    new_role = data.get('role', '').strip()
    new_password = data.get('password', '').strip()

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, role FROM users WHERE id = ?", (user_id,))
    target = c.fetchone()
    if not target:
        conn.close()
        return jsonify({'error': 'Потребителят не е намерен.'}), 404

    if new_role:
        if new_role not in ROLES:
            conn.close()
            return jsonify({'error': 'Невалидна роля.'}), 400
        if target[1] == ROLE_ADMIN and new_role != ROLE_ADMIN:
            c.execute("SELECT COUNT(*) FROM users WHERE role = ?", (ROLE_ADMIN,))
            if c.fetchone()[0] <= 1:
                conn.close()
                return jsonify({'error': 'Не може да премахнете ролята на единствения администратор.'}), 400
        c.execute("UPDATE users SET role = ? WHERE id = ?", (new_role, user_id))

    if new_password:
        if len(new_password) < 4:
            conn.close()
            return jsonify({'error': 'Паролата трябва да е поне 4 символа.'}), 400
        c.execute("UPDATE users SET password_hash = ? WHERE id = ?", (generate_password_hash(new_password), user_id))

    conn.commit()
    conn.close()
    return jsonify({'success': True})

# API: Delete a user (admin only)
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@require_role(ROLE_ADMIN)
def delete_user(user_id):
    if user_id == session.get('user_id'):
        return jsonify({'error': 'Не можете да изтриете собствения си акаунт.'}), 400

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT role FROM users WHERE id = ?", (user_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Потребителят не е намерен.'}), 404

    if row[0] == ROLE_ADMIN:
        c.execute("SELECT COUNT(*) FROM users WHERE role = ?", (ROLE_ADMIN,))
        if c.fetchone()[0] <= 1:
            conn.close()
            return jsonify({'error': 'Не може да изтриете единствения администратор.'}), 400

    c.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# API: Get all tools (with filters and search)
@app.route('/api/tools', methods=['GET'])
def get_tools():
    search_query = request.args.get('q', '').strip()
    category = request.args.get('category', 'all').strip()
    status = request.args.get('status', 'all').strip()
    dim_query = request.args.get('dim', '').strip()

    conn = sqlite3.connect(DB_PATH)
    conn.create_function("py_lower", 1, lambda x: str(x).lower() if x is not None else "")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    sql = "SELECT * FROM tools WHERE 1=1"
    params = []

    if category != 'all':
        sql += " AND category = ?"
        params.append(category)

    if status != 'all':
        sql += " AND status = ?"
        params.append(status)

    if dim_query:
        sql += " AND (py_lower(single_item_dimensions) LIKE py_lower(?) OR py_lower(dimensions) LIKE py_lower(?))"
        params.extend([f"%{dim_query}%", f"%{dim_query}%"])

    if search_query:
        sql += " AND (py_lower(code) LIKE py_lower(?) OR py_lower(name) LIKE py_lower(?) OR py_lower(client) LIKE py_lower(?) OR py_lower(location) LIKE py_lower(?) OR py_lower(notes) LIKE py_lower(?) OR py_lower(dimensions) LIKE py_lower(?) OR py_lower(single_item_dimensions) LIKE py_lower(?) OR py_lower(file_path) LIKE py_lower(?))"
        like_param = f"%{search_query}%"
        params.extend([like_param] * 8)

    sql += " ORDER BY id DESC"
    c.execute(sql, params)
    rows = c.fetchall()
    conn.close()

    tools_list = []
    for r in rows:
        tools_list.append({
            'id': r['id'],
            'code': r['code'],
            'category': r['category'],
            'name': r['name'],
            'client': r['client'],
            'dimensions': r['dimensions'],
            'location': r['location'],
            'image_filename': r['image_filename'],
            'status': r['status'],
            'notes': r['notes'],
            'created_at': r['created_at'],
            'die_shape': r['die_shape'],
            'ups': r['ups'],
            'material': r['material'],
            'die_type': r['die_type'],
            'single_item_dimensions': r['single_item_dimensions'],
            'file_path': r['file_path']
        })

    return jsonify(tools_list)

def parse_tool_form(form):
    """Extracts and normalizes the tool fields shared by add_tool and update_tool."""
    ups_str = form.get('ups', '1').strip()
    return {
        'category': form.get('category', '').strip(),
        'name': form.get('name', '').strip(),
        'client': form.get('client', '').strip(),
        'dimensions': form.get('dimensions', '').strip(),
        'location': form.get('location', '').strip(),
        'status': form.get('status', 'active').strip(),
        'notes': form.get('notes', '').strip(),
        'file_path': form.get('file_path', '').strip(),
        'die_shape': form.get('die_shape', '').strip(),
        'ups': int(ups_str) if ups_str.isdigit() else 1,
        'material': form.get('material', '').strip(),
        'die_type': form.get('die_type', '').strip(),
        'single_item_dimensions': form.get('single_item_dimensions', '').strip(),
    }

# API: Add new tool
@app.route('/api/tools', methods=['POST'])
@require_role(ROLE_ADMIN, ROLE_READ_WRITE)
def add_tool():
    fields = parse_tool_form(request.form)
    category = fields['category']
    name = fields['name']
    client = fields['client']
    dimensions = fields['dimensions']
    location = fields['location']
    status = fields['status']
    notes = fields['notes']
    file_path = fields['file_path']
    die_shape = fields['die_shape']
    ups = fields['ups']
    material = fields['material']
    die_type = fields['die_type']
    single_item_dimensions = fields['single_item_dimensions']
    custom_code = request.form.get('code', '').strip()

    if not category or not name:
        return jsonify({'error': 'Моля попълнете категория и име на инструмента'}), 400

    # Handle code generation or unique check
    if custom_code:
        code = custom_code
        # Check uniqueness
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT id FROM tools WHERE code = ?", (code,))
        if c.fetchone():
            conn.close()
            return jsonify({'error': f'Инструмент с код "{code}" вече съществува!'}), 400
        conn.close()
    else:
        code = generate_code(category)

    # Handle image upload
    image_filename = None
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '' and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower()
            # Unique filename with timestamp to prevent cache issues
            filename = f"{int(time.time())}_{secure_filename(file.filename)}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            image_filename = filename

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO tools (code, category, name, client, dimensions, location, image_filename, status, notes, die_shape, ups, material, die_type, single_item_dimensions, file_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (code, category, name, client, dimensions, location, image_filename, status, notes, die_shape, ups, material, die_type, single_item_dimensions, file_path))
    conn.commit()
    tool_id = c.lastrowid
    conn.close()

    return jsonify({
        'success': True,
        'tool': {
            'id': tool_id,
            'code': code,
            'category': category,
            'name': name,
            'client': client,
            'dimensions': dimensions,
            'location': location,
            'image_filename': image_filename,
            'status': status,
            'notes': notes,
            'die_shape': die_shape,
            'ups': ups,
            'material': material,
            'die_type': die_type,
            'single_item_dimensions': single_item_dimensions,
            'file_path': file_path
        }
    })

# API: Update tool
@app.route('/api/tools/<int:tool_id>', methods=['PUT'])
@require_role(ROLE_ADMIN, ROLE_READ_WRITE)
def update_tool(tool_id):
    fields = parse_tool_form(request.form)
    category = fields['category']
    name = fields['name']
    client = fields['client']
    dimensions = fields['dimensions']
    location = fields['location']
    status = fields['status']
    file_path = fields['file_path']
    notes = fields['notes']
    die_shape = fields['die_shape']
    ups = fields['ups']
    material = fields['material']
    die_type = fields['die_type']
    single_item_dimensions = fields['single_item_dimensions']
    code = request.form.get('code', '').strip()

    if not category or not name or not code:
        return jsonify({'error': 'Моля попълнете код, категория и име на инструмента'}), 400

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Check if code changed and is unique
    c.execute("SELECT id FROM tools WHERE code = ? AND id != ?", (code, tool_id))
    if c.fetchone():
        conn.close()
        return jsonify({'error': f'Инструмент с код "{code}" вече съществува!'}), 400

    # Get current image filename to delete it later if new image is uploaded
    c.execute("SELECT image_filename FROM tools WHERE id = ?", (tool_id,))
    row = c.fetchone()
    current_image = row[0] if row else None

    image_filename = current_image
    # If a new image is provided
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '' and allowed_file(file.filename):
            # Delete old file
            if current_image:
                old_file_path = os.path.join(app.config['UPLOAD_FOLDER'], current_image)
                if os.path.exists(old_file_path):
                    try:
                        os.remove(old_file_path)
                    except OSError:
                        logger.warning("Could not remove old image %s", old_file_path, exc_info=True)

            filename = f"{int(time.time())}_{secure_filename(file.filename)}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            image_filename = filename
    elif request.form.get('delete_image') == 'true':
        # User requested to clear current image
        if current_image:
            old_file_path = os.path.join(app.config['UPLOAD_FOLDER'], current_image)
            if os.path.exists(old_file_path):
                try:
                    os.remove(old_file_path)
                except OSError:
                    logger.warning("Could not remove image %s", old_file_path, exc_info=True)
        image_filename = None

    c.execute('''
        UPDATE tools
        SET code = ?, category = ?, name = ?, client = ?, dimensions = ?, location = ?, image_filename = ?, status = ?, notes = ?, die_shape = ?, ups = ?, material = ?, die_type = ?, single_item_dimensions = ?, file_path = ?
        WHERE id = ?
    ''', (code, category, name, client, dimensions, location, image_filename, status, notes, die_shape, ups, material, die_type, single_item_dimensions, file_path, tool_id))
    conn.commit()
    conn.close()

    return jsonify({'success': True})

# API: Copy tool design file and/or drawing image to a local folder specified by client
@app.route('/api/tools/<int:tool_id>/copy-file', methods=['POST'])
@require_role(ROLE_ADMIN, ROLE_READ_WRITE)
def copy_tool_file(tool_id):
    import shutil
    
    data = request.get_json() or {}
    dest_folder = data.get('destination_folder', '').strip()

    if not dest_folder:
        return jsonify({'error': 'Моля въведете път до целевата папка'}), 400

    if is_served_directory(dest_folder):
        return jsonify({'error': 'Целевата папка не може да бъде вътрешна папка на приложението (uploads/database) - файловете там стават публично достъпни без парола.'}), 400

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT code, name, image_filename, file_path FROM tools WHERE id = ?", (tool_id,))
    tool = c.fetchone()
    conn.close()
    
    if not tool:
        return jsonify({'error': 'Инструментът не е намерен!'}), 404
        
    # Ensure destination folder exists
    try:
        os.makedirs(dest_folder, exist_ok=True)
    except Exception as e:
        return jsonify({'error': f'Невалиден или недостъпен път на диска: {str(e)}'}), 400
        
    copied_files = []
    errors = []
    
    # 1. Copy original file_path if it exists
    original_path = tool['file_path']
    if original_path:
        if os.path.exists(original_path) and os.path.isfile(original_path):
            try:
                base_name = os.path.basename(original_path)
                shutil.copy2(original_path, os.path.join(dest_folder, base_name))
                copied_files.append(f"оригинален файл ({base_name})")
            except Exception as e:
                errors.append(f"Грешка при копиране на оригиналния файл: {str(e)}")
        else:
            errors.append("Оригиналният файл не беше намерен на посочения път.")
            
    # 2. Copy drawing image if it exists
    img_name = tool['image_filename']
    if img_name:
        src_img_path = os.path.join(app.config['UPLOAD_FOLDER'], img_name)
        if os.path.exists(src_img_path):
            try:
                # Rename to include tool code for clarity (e.g. SH-0001_die_box.svg)
                ext = img_name.rsplit('.', 1)[1].lower() if '.' in img_name else 'svg'
                # Clean name for filename
                safe_name = "".join([c if c.isalnum() or c in (' ', '_', '-') else '' for c in tool['name']]).strip().replace(' ', '_')
                dest_img_name = f"{tool['code']}_{safe_name}.{ext}"
                shutil.copy2(src_img_path, os.path.join(dest_folder, dest_img_name))
                copied_files.append(f"чертеж ({dest_img_name})")
            except Exception as e:
                errors.append(f"Грешка при копиране на чертежа: {str(e)}")
        else:
            errors.append("Чертежът не беше намерен в папката на сървъра.")
            
    if not copied_files:
        err_msg = "Не бяха копирани файлове. " + " ".join(errors)
        return jsonify({'error': err_msg}), 400
        
    success_msg = f"Успешно копирахте: {', '.join(copied_files)} в папка \"{dest_folder}\"."
    if errors:
        success_msg += " Забележки: " + " ".join(errors)
        
    return jsonify({'success': True, 'message': success_msg})

# API: Delete tool
@app.route('/api/tools/<int:tool_id>', methods=['DELETE'])
@require_role(ROLE_ADMIN, ROLE_READ_WRITE)
def delete_tool(tool_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Get image filename to delete the file
    c.execute("SELECT image_filename FROM tools WHERE id = ?", (tool_id,))
    row = c.fetchone()
    image_filename = row[0] if row else None
    
    if image_filename:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                logger.warning("Could not remove image %s", file_path, exc_info=True)

    c.execute("DELETE FROM tools WHERE id = ?", (tool_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

if __name__ == '__main__':
    bootstrap_password = init_db()
    local_ip = get_local_ip()
    print("==================================================")
    print(f" Сървърът стартира успешно!")
    print(f" Локален достъп: http://localhost:5050")
    print(f" Достъп от мрежата: http://{local_ip}:5050")
    if bootstrap_password:
        print(" Създаден е първоначален администраторски акаунт:")
        print("   Потребител: admin")
        print(f"   Парола: {bootstrap_password}")
        print("   (запазете я някъде - вижда се само сега; може да я смените от /account след вход)")
    print("==================================================")
    app.run(host='0.0.0.0', port=5050, debug=False)
