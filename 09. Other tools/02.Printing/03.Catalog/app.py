import os
import sqlite3
import socket
import time
from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configurations
UPLOAD_FOLDER = 'uploads'
DB_FOLDER = 'database'
DB_PATH = os.path.join(DB_FOLDER, 'catalog.db')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'svg'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DB_FOLDER, exist_ok=True)

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
        
    conn.commit()
    conn.close()

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
    return render_template('index.html', local_ip=local_ip)

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
        sql += " AND py_lower(dimensions) LIKE py_lower(?)"
        params.append(f"%{dim_query}%")

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

# API: Add new tool
@app.route('/api/tools', methods=['POST'])
def add_tool():
    category = request.form.get('category', '').strip()
    name = request.form.get('name', '').strip()
    client = request.form.get('client', '').strip()
    dimensions = request.form.get('dimensions', '').strip()
    location = request.form.get('location', '').strip()
    status = request.form.get('status', 'active').strip()
    notes = request.form.get('notes', '').strip()
    file_path = request.form.get('file_path', '').strip()
    custom_code = request.form.get('code', '').strip()
    
    # New Die Specific Fields
    die_shape = request.form.get('die_shape', '').strip()
    ups_str = request.form.get('ups', '1').strip()
    material = request.form.get('material', '').strip()
    die_type = request.form.get('die_type', '').strip()
    single_item_dimensions = request.form.get('single_item_dimensions', '').strip()
    
    ups = 1
    if ups_str.isdigit():
        ups = int(ups_str)

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
def update_tool(tool_id):
    category = request.form.get('category', '').strip()
    name = request.form.get('name', '').strip()
    client = request.form.get('client', '').strip()
    dimensions = request.form.get('dimensions', '').strip()
    location = request.form.get('location', '').strip()
    status = request.form.get('status', 'active').strip()
    file_path = request.form.get('file_path', '').strip()
    notes = request.form.get('notes', '').strip()
    code = request.form.get('code', '').strip()
    
    # New Die Specific Fields
    die_shape = request.form.get('die_shape', '').strip()
    ups_str = request.form.get('ups', '1').strip()
    material = request.form.get('material', '').strip()
    die_type = request.form.get('die_type', '').strip()
    single_item_dimensions = request.form.get('single_item_dimensions', '').strip()
    
    ups = 1
    if ups_str.isdigit():
        ups = int(ups_str)

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
                    except Exception:
                        pass
            
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
                except Exception:
                    pass
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
def copy_tool_file(tool_id):
    import shutil
    
    data = request.get_json() or {}
    dest_folder = data.get('destination_folder', '').strip()
    
    if not dest_folder:
        return jsonify({'error': 'Моля въведете път до целевата папка'}), 400
        
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
            except Exception:
                pass
                
    c.execute("DELETE FROM tools WHERE id = ?", (tool_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

if __name__ == '__main__':
    init_db()
    local_ip = get_local_ip()
    print("==================================================")
    print(f" Сървърът стартира успешно!")
    print(f" Локален достъп: http://localhost:5050")
    print(f" Достъп от мрежата: http://{local_ip}:5050")
    print("==================================================")
    app.run(host='0.0.0.0', port=5050, debug=False)
