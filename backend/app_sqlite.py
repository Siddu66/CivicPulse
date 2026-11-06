from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pathlib import Path
from datetime import datetime
import sqlite3, uuid
ROOT=Path(__file__).resolve().parent
UPLOADS=ROOT/"uploads"; UPLOADS.mkdir(exist_ok=True)
DB=ROOT/"complaints.db"
app=Flask(__name__); CORS(app); app.config["MAX_CONTENT_LENGTH"]=5*1024*1024
def connect():
 c=sqlite3.connect(DB); c.row_factory=sqlite3.Row; return c
def init_db():
 with connect() as c:
  c.execute("""CREATE TABLE IF NOT EXISTS complaints(id INTEGER PRIMARY KEY AUTOINCREMENT,citizen_name TEXT NOT NULL,category TEXT NOT NULL,description TEXT NOT NULL,location TEXT NOT NULL,latitude REAL,longitude REAL,image_filename TEXT,status TEXT NOT NULL DEFAULT 'Pending',created_at TEXT NOT NULL)""")
@app.get("/")
def home():
    return "PS-14 Community Problem Reporting Backend is Running!"
@app.get("/api/health")
def health(): return jsonify(status="ok",message="PS-14 backend is running")
@app.get("/api/complaints")
def get_all():
 with connect() as c: rows=c.execute("SELECT * FROM complaints ORDER BY id DESC").fetchall()
 out=[]
 for r in rows:
  x=dict(r); x["image_url"]=f"http://127.0.0.1:5000/uploads/{x['image_filename']}" if x["image_filename"] else None; out.append(x)
 return jsonify(out)
@app.post("/api/complaints")
def create():
 fields={k:request.form.get(k,"").strip() for k in ["citizen_name","category","description","location"]}
 if not all(fields.values()): return jsonify(error="Please fill in name, category, description and location."),400
 lat=request.form.get("latitude") or None; lng=request.form.get("longitude") or None
 img=request.files.get("image"); filename=None
 if img and img.filename:
  safe=secure_filename(img.filename); ext=safe.rsplit(".",1)[-1].lower() if "." in safe else ""
  if ext not in {"png","jpg","jpeg","webp"}: return jsonify(error="Use PNG, JPG, JPEG or WEBP images."),400
  filename=f"{uuid.uuid4().hex}.{ext}"; img.save(UPLOADS/filename)
 with connect() as c:
  cur=c.execute("""INSERT INTO complaints(citizen_name,category,description,location,latitude,longitude,image_filename,status,created_at) VALUES(?,?,?,?,?,?,?,'Pending',?)""",(fields["citizen_name"],fields["category"],fields["description"],fields["location"],float(lat) if lat else None,float(lng) if lng else None,filename,datetime.now().isoformat(timespec="seconds")))
 return jsonify(message="Complaint submitted",id=cur.lastrowid),201
@app.patch("/api/complaints/<int:cid>")
def update(cid):
 status=(request.get_json(silent=True) or {}).get("status")
 if status not in {"Pending","In Progress","Resolved"}: return jsonify(error="Invalid status"),400
 with connect() as c:
  cur=c.execute("UPDATE complaints SET status=? WHERE id=?",(status,cid))
  if cur.rowcount==0: return jsonify(error="Complaint not found"),404
 return jsonify(message="Status updated")
@app.get("/uploads/<path:filename>")
def upload(filename): return send_from_directory(UPLOADS,filename)
@app.errorhandler(413)
def too_big(_): return jsonify(error="Image exceeds 5 MB"),413
if __name__=="__main__": init_db(); app.run(debug=True,port=5000)
