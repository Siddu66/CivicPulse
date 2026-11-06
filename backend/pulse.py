
import os
import math
from uuid import uuid4

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

app = Flask(__name__)
CORS(app)

# ---------------- SUPABASE CONNECTION ----------------

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

supabase: Client | None = None

if supabase_url and supabase_key:
    supabase = create_client(supabase_url, supabase_key)
    print("Supabase connected successfully!")
else:
    print("Supabase credentials not found. Check backend/.env")


# ---------------- AUTHENTICATION ----------------

def get_authenticated_user():
    if supabase is None:
        return None

    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1].strip()

    if not token:
        return None

    try:
        return supabase.auth.get_user(token).user
    except Exception as e:
        print("Authentication error:", str(e))
        return None


def check_role(required_role):
    user = get_authenticated_user()

    if not user:
        return None, (jsonify({
            "success": False,
            "error": "Authentication required"
        }), 401)

    if supabase is None:
        return None, (jsonify({
            "success": False,
            "error": "Database not connected"
        }), 500)

    try:
        result = (
            supabase.table("profiles")
            .select("role")
            .eq("id", user.id)
            .limit(1)
            .execute()
        )

        if not result.data or result.data[0]["role"] != required_role:
            return None, (jsonify({
                "success": False,
                "error": f"{required_role.capitalize()} access required"
            }), 403)

        return user, None

    except Exception as e:
        print("Role verification error:", str(e))
        return None, (jsonify({
            "success": False,
            "error": "Could not verify user role"
        }), 500)


def get_admin_user():
    return check_role("admin")


def get_administrator_user():
    return check_role("administrator")


# ---------------- WARD ACCESS HELPERS ----------------

def clean_location(value):
    return str(value or "").strip().casefold()


def get_admin_profile(user):
    result = (
        supabase.table("profiles")
        .select("district, area, ward")
        .eq("id", user.id)
        .limit(1)
        .execute()
    )

    if not result.data:
        raise ValueError("Admin profile not found.")

    profile = result.data[0]

    if not all(clean_location(profile.get(field)) for field in [
        "district", "area", "ward"
    ]):
        raise ValueError(
            "Please configure this admin's district, area and ward in Supabase."
        )

    return profile


def admin_can_access_complaint(user, complaint_id):
    profile = get_admin_profile(user)

    result = (
        supabase.table("complaints")
        .select(
            "id, incident_district, incident_area, incident_ward"
        )
        .eq("id", complaint_id)
        .limit(1)
        .execute()
    )

    if not result.data:
        return False

    complaint = result.data[0]

    return (
        clean_location(complaint.get("incident_district"))
        == clean_location(profile.get("district"))
        and clean_location(complaint.get("incident_area"))
        == clean_location(profile.get("area"))
        and clean_location(complaint.get("incident_ward"))
        == clean_location(profile.get("ward"))
    )


def check_admin_complaint_access(user, complaint_id):
    try:
        if not admin_can_access_complaint(user, complaint_id):
            return jsonify({
                "success": False,
                "error": "You cannot access complaints outside your assigned ward."
            }), 403

        return None

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 403


# ---------------- AUTOMATIC CLASSIFICATION ----------------

DEPARTMENT_KEYWORDS = {
    "Electricity": [
        "streetlight", "street light", "electricity",
        "power outage", "power cut", "electric pole",
        "transformer", "electric wire", "electric",
        "light not working", "no electricity",
        "exposed wire", "electric shock"
    ],
    "Water Supply": [
        "water leakage", "water leak", "water supply",
        "water shortage", "drinking water", "pipeline",
        "pipe burst", "tap water", "no water",
        "water connection"
    ],
    "Sanitation": [
        "garbage", "waste", "dustbin", "trash",
        "rubbish", "litter", "cleanliness",
        "overflowing bin", "solid waste",
        "not collected", "waste collection",
        "garbage collection", "dirty area"
    ],
    "Roads": [
        "pothole", "road damage", "broken road",
        "road repair", "footpath", "pavement",
        "damaged road", "traffic sign",
        "road accident", "damaged street"
    ],
    "Drainage": [
        "drain", "drainage", "sewage",
        "sewer", "blocked drain", "waterlogging",
        "flooding", "manhole", "overflowing sewage"
    ],
    "Public Works": [
        "public building", "park", "playground",
        "community hall", "government building",
        "public toilet", "broken bench"
    ]
}

CATEGORY_MAPPING = {
    "Electricity": "Electricity & Lighting",
    "Water Supply": "Water Supply",
    "Sanitation": "Sanitation & Waste Management",
    "Roads": "Roads & Infrastructure",
    "Drainage": "Drainage & Sewage",
    "Public Works": "Public Works",
    "Other": "Other"
}


def classify_department(title, description, category=None):
    text = f"{title or ''} {description or ''} {category or ''}".lower()

    scores = {}

    for department, keywords in DEPARTMENT_KEYWORDS.items():
        scores[department] = sum(
            1 for keyword in keywords if keyword in text
        )

    best_department = max(scores, key=scores.get)

    if scores[best_department] == 0:
        return "Other"

    return best_department


def classify_category(title, description, category=None):
    department = classify_department(title, description, category)
    return CATEGORY_MAPPING.get(department, "Other")


def predict_priority(title, description, category=None):
    text = f"{title or ''} {description or ''} {category or ''}".lower()

    high_keywords = [
        "life threatening", "emergency", "accident",
        "exposed wire", "electric shock", "fire",
        "major flooding", "building collapse",
        "severe injury", "gas leak", "dangerous",
        "fallen electric wire", "live wire",
        "burst main pipeline"
    ]

    medium_keywords = [
        "streetlight", "street light", "pothole",
        "water leakage", "drain blockage",
        "sewage", "broken road", "overflowing drain",
        "power outage", "garbage overflow",
        "water shortage"
    ]

    if any(word in text for word in high_keywords):
        return "High"

    if any(word in text for word in medium_keywords):
        return "Medium"

    return "Low"


def generate_predictions(title, description, category=None):
    department = classify_department(title, description, category)
    ai_category = classify_category(title, description, category)
    priority = predict_priority(title, description, category)

    return {
        "department": department,
        "ai_category": ai_category,
        "ai_priority": priority,
        "priority": priority,
        "category_confidence": (
            0.85 if department != "Other" else 0.40
        )
    }


# ---------------- BACKFILL OLD COMPLAINTS ----------------

def backfill_missing_departments(complaints):
    if supabase is None:
        return complaints

    for complaint in complaints:
        updates = {}

        predictions = generate_predictions(
            complaint.get("title"),
            complaint.get("description"),
            complaint.get("category")
        )

        for field in [
            "department",
            "ai_category",
            "ai_priority",
            "priority",
            "category_confidence"
        ]:
            if not complaint.get(field):
                updates[field] = predictions[field]

        if updates:
            try:
                result = (
                    supabase.table("complaints")
                    .update(updates)
                    .eq("id", complaint["id"])
                    .execute()
                )

                if result.data:
                    complaint.update(updates)

            except Exception as e:
                print(
                    f"Could not update old complaint "
                    f"{complaint.get('id')}: {e}"
                )

    return complaints


# ---------------- RESOLUTION PROOF SIGNED URL ----------------

def create_resolution_signed_url(file_path):
    result = supabase.storage.from_(
        "resolution-proofs"
    ).create_signed_url(file_path, 3600)

    if isinstance(result, dict):
        return (
            result.get("signedURL")
            or result.get("signedUrl")
            or result.get("signed_url")
        )

    data = getattr(result, "data", None)

    if isinstance(data, dict):
        return (
            data.get("signedURL")
            or data.get("signedUrl")
            or data.get("signed_url")
        )

    return (
        getattr(result, "signed_url", None)
        or getattr(result, "signedURL", None)
    )


# ---------------- HOME AND HEALTH ----------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Welcome to CivicPulse API!",
        "status": "running"
    })


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "message": "CivicPulse backend is healthy"
    })


# ---------------- GET COMPLAINTS ----------------

@app.route("/api/complaints", methods=["GET"])
def get_complaints():
    if supabase is None:
        return jsonify({
            "success": False,
            "error": "Database not connected"
        }), 500

    user = get_authenticated_user()

    if not user:
        return jsonify({
            "success": False,
            "error": "Authentication required"
        }), 401

    try:
        profile_result = (
            supabase.table("profiles")
            .select("role")
            .eq("id", user.id)
            .limit(1)
            .execute()
        )

        if not profile_result.data:
            return jsonify({
                "success": False,
                "error": "Profile not found"
            }), 403

        role = profile_result.data[0]["role"]

        if role not in ["admin", "administrator"]:
            return jsonify({
                "success": False,
                "error": "Admin access required"
            }), 403

        query = supabase.table("complaints").select("*")

        if role == "admin":
            admin = get_admin_profile(user)

            # Exact matching of incident location fields.
            query = (
                query
                .eq("incident_district", admin["district"].strip())
                .eq("incident_area", admin["area"].strip())
                .eq("incident_ward", admin["ward"].strip())
            )

        status = request.args.get("status")
        category = request.args.get("category")
        priority = request.args.get("priority")

        if status:
            query = query.eq("status", status)

        if category:
            query = query.eq("category", category)

        if priority:
            query = query.eq("priority", priority)

        response = query.order(
            "created_at", desc=True
        ).execute()

        complaints = backfill_missing_departments(
            response.data or []
        )

        return jsonify({
            "success": True,
            "complaints": complaints
        }), 200

    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400

    except Exception as e:
        print("Get complaints error:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------- CREATE COMPLAINT ----------------

@app.route("/api/complaints", methods=["POST"])
def create_complaint():
    if supabase is None:
        return jsonify({
            "success": False,
            "error": "Database not connected"
        }), 500

    user = get_authenticated_user()

    if not user:
        return jsonify({
            "success": False,
            "error": "Please log in to submit a complaint"
        }), 401

    data = request.form if request.form else (
        request.get_json(silent=True) or {}
    )

    title = data.get("title")
    description = data.get("description")
    category = data.get("category")
    location = data.get("location")

    # Actual incident location, not citizen's registered address.
    incident_district = str(
        data.get("incident_district") or ""
    ).strip()

    incident_area = str(
        data.get("incident_area") or ""
    ).strip()

    incident_ward = str(
        data.get("incident_ward") or ""
    ).strip()

    if not all([
        incident_district,
        incident_area,
        incident_ward
    ]):
        return jsonify({
            "success": False,
            "error": "Incident district, area and ward are required."
        }), 400

    # Validate GPS coordinates.
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    try:
        latitude = (
            float(latitude) if latitude not in (None, "") else None
        )
        longitude = (
            float(longitude) if longitude not in (None, "") else None
        )

        if (latitude is None) != (longitude is None):
            raise ValueError("Both GPS coordinates are required")

        if latitude is not None:
            if (
                not math.isfinite(latitude)
                or not math.isfinite(longitude)
                or not -90 <= latitude <= 90
                or not -180 <= longitude <= 180
            ):
                raise ValueError("Invalid GPS coordinates")

    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "error": "Invalid GPS coordinates. Please detect your location again."
        }), 400

    if not title or not description or not location:
        return jsonify({
            "success": False,
            "error": "Title, description and location are required"
        }), 400

    predictions = generate_predictions(
        title,
        description,
        category
    )

    image_url = None
    image = request.files.get("image")

    try:
        if image and image.filename:
            allowed_types = {
                "image/jpeg": ".jpg",
                "image/png": ".png",
                "image/webp": ".webp"
            }

            if image.mimetype not in allowed_types:
                return jsonify({
                    "success": False,
                    "error": "Only JPG, PNG and WEBP images are allowed"
                }), 400

            image_bytes = image.read()

            if len(image_bytes) > 5 * 1024 * 1024:
                return jsonify({
                    "success": False,
                    "error": "Image must be smaller than 5 MB"
                }), 400

            file_path = (
                f"{uuid4().hex}"
                f"{allowed_types[image.mimetype]}"
            )

            bucket = supabase.storage.from_("complaint-images")

            bucket.upload(
                file_path,
                image_bytes,
                file_options={
                    "content-type": image.mimetype,
                    "upsert": "false"
                }
            )

            image_url = bucket.get_public_url(file_path)

        insert_data = {
            "title": title,
            "description": description,
            "category": category or None,
            "ai_category": predictions["ai_category"],
            "category_confidence": predictions["category_confidence"],
            "department": predictions["department"],
            "ai_priority": predictions["ai_priority"],
            "priority": predictions["priority"],
            "location": location,
            "incident_district": incident_district,
            "incident_area": incident_area,
            "incident_ward": incident_ward,
            "latitude": latitude,
            "longitude": longitude,
            "image_url": image_url,
            "user_id": user.id,
            "status": "Pending"
        }

        response = (
            supabase.table("complaints")
            .insert(insert_data)
            .execute()
        )

        if not response.data:
            raise Exception("Complaint was not saved")

        return jsonify({
            "success": True,
            "message": "Complaint submitted successfully!",
            "predictions": predictions,
            "complaint": response.data[0]
        }), 201

    except Exception as e:
        print("Complaint submission error:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------- SAVE AI SUGGESTION ----------------

@app.route(
    "/api/complaints/<int:complaint_id>/ai-suggestion",
    methods=["POST"]
)
def save_ai_suggestion(complaint_id):
    user, error = get_admin_user()

    if error:
        return error

    access_error = check_admin_complaint_access(user, complaint_id)
    if access_error:
        return access_error

    data = request.get_json(silent=True) or {}

    ai_category = data.get("ai_category")
    ai_priority = data.get("ai_priority", "Medium")
    confidence = data.get("category_confidence")

    allowed_priorities = ["Low", "Medium", "High", "Critical"]

    if not ai_category:
        return jsonify({
            "success": False,
            "error": "AI category is required"
        }), 400

    if ai_priority not in allowed_priorities:
        return jsonify({
            "success": False,
            "error": "Invalid AI priority"
        }), 400

    if confidence is not None:
        try:
            confidence = float(confidence)
            if not 0 <= confidence <= 1:
                raise ValueError()
        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "error": "Confidence must be between 0 and 1"
            }), 400

    try:
        response = (
            supabase.table("complaints")
            .update({
                "ai_category": ai_category,
                "ai_priority": ai_priority,
                "category_confidence": confidence
            })
            .eq("id", complaint_id)
            .execute()
        )

        if not response.data:
            return jsonify({
                "success": False,
                "error": "Complaint not found"
            }), 404

        return jsonify({
            "success": True,
            "message": "AI suggestion saved successfully!",
            "complaint": response.data[0]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------- APPROVE CATEGORY AND PRIORITY ----------------

@app.route(
    "/api/complaints/<int:complaint_id>/approve",
    methods=["PUT"]
)
def approve_complaint(complaint_id):
    user, error = get_admin_user()

    if error:
        return error

    access_error = check_admin_complaint_access(user, complaint_id)
    if access_error:
        return access_error

    data = request.get_json(silent=True) or {}

    approved_category = data.get("category")
    approved_priority = data.get("priority", "Medium")

    allowed_priorities = ["Low", "Medium", "High", "Critical"]

    if not approved_category:
        return jsonify({
            "success": False,
            "error": "Approved category is required"
        }), 400

    if approved_priority not in allowed_priorities:
        return jsonify({
            "success": False,
            "error": "Invalid priority"
        }), 400

    try:
        response = (
            supabase.table("complaints")
            .update({
                "category": approved_category,
                "admin_verified_category": approved_category,
                "priority": approved_priority
            })
            .eq("id", complaint_id)
            .execute()
        )

        if not response.data:
            return jsonify({
                "success": False,
                "error": "Complaint not found"
            }), 404

        return jsonify({
            "success": True,
            "message": "Complaint approved successfully!",
            "complaint": response.data[0]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------- ADMIN UPDATE COMPLAINT ----------------

@app.route(
    "/api/complaints/<int:complaint_id>",
    methods=["PUT"]
)
def update_complaint(complaint_id):
    user, error = get_admin_user()

    if error:
        return error

    access_error = check_admin_complaint_access(user, complaint_id)
    if access_error:
        return access_error

    data = request.get_json(silent=True) or {}
    updates = {}

    if "status" in data:
        new_status = data["status"]

        allowed_statuses = [
            "Pending",
            "In Progress",
            "Awaiting Citizen Confirmation",
            "Rejected"
        ]

        if new_status not in allowed_statuses:
            return jsonify({
                "success": False,
                "error": "Invalid status. Citizen confirmation is required to resolve."
            }), 400

        updates["status"] = new_status

    if "assigned_to" in data:
        assigned_to = data["assigned_to"]

        if assigned_to is not None and (
            not isinstance(assigned_to, str)
            or not assigned_to.strip()
        ):
            return jsonify({
                "success": False,
                "error": "Invalid assigned staff name"
            }), 400

        updates["assigned_to"] = (
            assigned_to.strip() if assigned_to else None
        )

    if not updates:
        return jsonify({
            "success": False,
            "error": "No valid updates provided"
        }), 400

    try:
        response = (
            supabase.table("complaints")
            .update(updates)
            .eq("id", complaint_id)
            .execute()
        )

        if not response.data:
            return jsonify({
                "success": False,
                "error": "Complaint not found"
            }), 404

        return jsonify({
            "success": True,
            "message": "Complaint updated successfully!",
            "complaint": response.data[0]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------- ADMINISTRATOR STATUS ROUTE ----------------

@app.route(
    "/api/administrator/complaints/<int:complaint_id>/status",
    methods=["PUT"]
)
def administrator_update_complaint_status(complaint_id):
    user, error = get_administrator_user()

    if error:
        return error

    data = request.get_json(silent=True) or {}
    status = data.get("status")

    allowed_statuses = [
        "Pending",
        "In Progress",
        "Rejected"
    ]

    if status not in allowed_statuses:
        return jsonify({
            "success": False,
            "error": "Invalid complaint status"
        }), 400

    try:
        existing = (
            supabase.table("complaints")
            .select("id, assigned_to")
            .eq("id", complaint_id)
            .limit(1)
            .execute()
        )

        if not existing.data:
            return jsonify({
                "success": False,
                "error": "Complaint not found"
            }), 404

        if not existing.data[0].get("assigned_to"):
            return jsonify({
                "success": False,
                "error": "This complaint has not been assigned yet"
            }), 403

        result = (
            supabase.table("complaints")
            .update({"status": status})
            .eq("id", complaint_id)
            .execute()
        )

        if not result.data:
            return jsonify({
                "success": False,
                "error": "Could not update complaint"
            }), 500

        return jsonify({
            "success": True,
            "message": "Complaint status updated successfully",
            "complaint": result.data[0]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------- COMPLAINT STATUS HISTORY ----------------

@app.route(
    "/api/complaints/<int:complaint_id>/history",
    methods=["GET"]
)
def get_complaint_history(complaint_id):
    if supabase is None:
        return jsonify({
            "success": False,
            "error": "Database not connected"
        }), 500

    user = get_authenticated_user()

    if not user:
        return jsonify({
            "success": False,
            "error": "Authentication required"
        }), 401

    try:
        profile = (
            supabase.table("profiles")
            .select("role")
            .eq("id", user.id)
            .limit(1)
            .execute()
        )

        if not profile.data:
            return jsonify({
                "success": False,
                "error": "Profile not found"
            }), 403

        role = profile.data[0]["role"]

        if role == "citizen":
            owned = (
                supabase.table("complaints")
                .select("id")
                .eq("id", complaint_id)
                .eq("user_id", user.id)
                .limit(1)
                .execute()
            )

            if not owned.data:
                return jsonify({
                    "success": False,
                    "error": "You cannot view this complaint history"
                }), 403

        elif role == "admin":
            access_error = check_admin_complaint_access(
                user, complaint_id
            )
            if access_error:
                return access_error

        elif role != "administrator":
            return jsonify({
                "success": False,
                "error": "Access denied"
            }), 403

        response = (
            supabase.table("complaint_status_history")
            .select("*")
            .eq("complaint_id", complaint_id)
            .order("changed_at", desc=False)
            .execute()
        )

        return jsonify({
            "success": True,
            "history": response.data
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------- ADMIN STATISTICS ----------------

@app.route("/api/admin/stats", methods=["GET"])
def get_admin_stats():
    user, error = get_admin_user()

    if error:
        return error

    if supabase is None:
        return jsonify({
            "success": False,
            "error": "Database not connected"
        }), 500

    try:
        admin = get_admin_profile(user)

        response = (
            supabase.table("complaints")
            .select("status, priority")
            .eq("incident_district", admin["district"].strip())
            .eq("incident_area", admin["area"].strip())
            .eq("incident_ward", admin["ward"].strip())
            .execute()
        )

        complaints = response.data or []

        stats = {
            "total": len(complaints),
            "pending": 0,
            "in_progress": 0,
            "resolved": 0,
            "rejected": 0,
            "high_priority": 0,
            "critical_priority": 0
        }

        for complaint in complaints:
            status = complaint.get("status")
            priority = complaint.get("priority")

            if status == "Pending":
                stats["pending"] += 1
            elif status == "In Progress":
                stats["in_progress"] += 1
            elif status == "Resolved":
                stats["resolved"] += 1
            elif status == "Rejected":
                stats["rejected"] += 1

            if priority == "High":
                stats["high_priority"] += 1
            elif priority == "Critical":
                stats["critical_priority"] += 1

        return jsonify({
            "success": True,
            "stats": stats
        }), 200

    except Exception as e:
        print("Admin statistics error:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------- ADMIN UPLOAD RESOLUTION PROOF ----------------

@app.route(
    "/api/complaints/<int:complaint_id>/resolution-proof",
    methods=["POST"]
)
def upload_resolution_proof(complaint_id):
    user, error = get_admin_user()

    if error:
        return error

    access_error = check_admin_complaint_access(user, complaint_id)
    if access_error:
        return access_error

    image = request.files.get("image")

    if not image or not image.filename:
        return jsonify({
            "success": False,
            "error": "Please select an image"
        }), 400

    allowed_types = ["image/jpeg", "image/png", "image/webp"]

    if image.mimetype not in allowed_types:
        return jsonify({
            "success": False,
            "error": "Only JPG, PNG and WEBP images are allowed"
        }), 400

    try:
        image_bytes = image.read()

        if len(image_bytes) > 5 * 1024 * 1024:
            return jsonify({
                "success": False,
                "error": "Image must be smaller than 5 MB"
            }), 400

        extension = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp"
        }[image.mimetype]

        file_path = (
            f"complaint-{complaint_id}/{uuid4()}.{extension}"
        )

        supabase.storage.from_("resolution-proofs").upload(
            file_path,
            image_bytes,
            file_options={
                "content-type": image.mimetype
            }
        )

        result = (
            supabase.table("complaints")
            .update({
                "resolution_proof_url": file_path,
                "status": "Awaiting Citizen Confirmation"
            })
            .eq("id", complaint_id)
            .execute()
        )

        if not result.data:
            return jsonify({
                "success": False,
                "error": "Proof uploaded but complaint status could not be updated"
            }), 500

        return jsonify({
            "success": True,
            "message": "Resolution proof uploaded successfully!",
            "file_path": file_path
        }), 200

    except Exception as e:
        print("Resolution proof upload error:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------- CITIZEN VIEW RESOLUTION PROOF ----------------

@app.route(
    "/api/complaints/<int:complaint_id>/resolution-proof-url",
    methods=["GET"]
)
def get_resolution_proof_url(complaint_id):
    user = get_authenticated_user()

    if not user:
        return jsonify({
            "success": False,
            "error": "Authentication required"
        }), 401

    if supabase is None:
        return jsonify({
            "success": False,
            "error": "Database not connected"
        }), 500

    try:
        complaint = (
            supabase.table("complaints")
            .select("user_id, resolution_proof_url")
            .eq("id", complaint_id)
            .limit(1)
            .execute()
        )

        if not complaint.data:
            return jsonify({
                "success": False,
                "error": "Complaint not found"
            }), 404

        record = complaint.data[0]

        if str(record.get("user_id")) != str(user.id):
            return jsonify({
                "success": False,
                "error": "You are not allowed to view this photo"
            }), 403

        file_path = record.get("resolution_proof_url")

        if not file_path:
            return jsonify({
                "success": False,
                "error": "No resolution photo uploaded"
            }), 404

        signed_url = create_resolution_signed_url(file_path)

        if not signed_url:
            return jsonify({
                "success": False,
                "error": "Could not create photo viewing link"
            }), 500

        return jsonify({
            "success": True,
            "signed_url": signed_url
        }), 200

    except Exception as e:
        print("Citizen resolution proof error:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------- ADMINISTRATOR VIEW RESOLUTION PROOF ----------------

@app.route(
    "/api/administrator/complaints/<int:complaint_id>/resolution-proof",
    methods=["GET"]
)
def administrator_view_resolution_proof(complaint_id):
    user, error = get_administrator_user()

    if error:
        return error

    if supabase is None:
        return jsonify({
            "success": False,
            "error": "Database not connected"
        }), 500

    try:
        complaint = (
            supabase.table("complaints")
            .select("id, assigned_to, resolution_proof_url")
            .eq("id", complaint_id)
            .limit(1)
            .execute()
        )

        if not complaint.data:
            return jsonify({
                "success": False,
                "error": "Complaint not found"
            }), 404

        record = complaint.data[0]

        if not record.get("assigned_to"):
            return jsonify({
                "success": False,
                "error": "This complaint has not been assigned"
            }), 403

        file_path = record.get("resolution_proof_url")

        if not file_path:
            return jsonify({
                "success": False,
                "error": "Resolution proof has not been uploaded"
            }), 404

        signed_url = create_resolution_signed_url(file_path)

        if not signed_url:
            return jsonify({
                "success": False,
                "error": "Could not generate resolution photo link"
            }), 500

        return jsonify({
            "success": True,
            "url": signed_url
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------- ADMIN CORRECT COMPLAINT LOCATION ----------------

@app.route(
    "/api/complaints/<int:complaint_id>/location",
    methods=["PUT"]
)
def correct_complaint_location(complaint_id):
    user, error = get_admin_user()

    if error:
        return error

    access_error = check_admin_complaint_access(user, complaint_id)
    if access_error:
        return access_error

    data = request.get_json(silent=True) or {}

    location = data.get("location")
    incident_district = data.get("incident_district")
    incident_area = data.get("incident_area")
    incident_ward = data.get("incident_ward")

    if not isinstance(location, str) or not location.strip():
        return jsonify({
            "success": False,
            "error": "A valid location is required"
        }), 400

    updates = {"location": location.strip()}

    # Update routing fields too if the admin corrects the incident area.
    if incident_district is not None:
        updates["incident_district"] = str(incident_district).strip()

    if incident_area is not None:
        updates["incident_area"] = str(incident_area).strip()

    if incident_ward is not None:
        updates["incident_ward"] = str(incident_ward).strip()

    try:
        result = (
            supabase.table("complaints")
            .update(updates)
            .eq("id", complaint_id)
            .execute()
        )

        if not result.data:
            return jsonify({
                "success": False,
                "error": "Complaint not found"
            }), 404

        return jsonify({
            "success": True,
            "message": "Complaint location corrected successfully!",
            "complaint": result.data[0]
        }), 200

    except Exception as e:
        print("Location correction error:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------- CITIZEN GET OWN COMPLAINTS ----------------

@app.route("/api/my-complaints", methods=["GET"])
def get_my_complaints():
    user = get_authenticated_user()

    if not user:
        return jsonify({
            "success": False,
            "error": "Authentication required"
        }), 401

    if supabase is None:
        return jsonify({
            "success": False,
            "error": "Database not connected"
        }), 500

    try:
        result = (
            supabase.table("complaints")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", desc=True)
            .execute()
        )

        complaints = backfill_missing_departments(
            result.data or []
        )

        return jsonify({
            "success": True,
            "complaints": complaints
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------- CITIZEN ACCEPT OR REJECT RESOLUTION ----------------

@app.route(
    "/api/complaints/<int:complaint_id>/resolution-decision",
    methods=["PUT"]
)
def citizen_resolution_decision(complaint_id):
    user = get_authenticated_user()

    if not user:
        return jsonify({
            "success": False,
            "error": "Authentication required"
        }), 401

    if supabase is None:
        return jsonify({
            "success": False,
            "error": "Database not connected"
        }), 500

    data = request.get_json(silent=True) or {}
    decision = data.get("decision")

    if decision not in ["accepted", "rejected"]:
        return jsonify({
            "success": False,
            "error": "Invalid decision"
        }), 400

    try:
        complaint = (
            supabase.table("complaints")
            .select("id, user_id, status, resolution_proof_url")
            .eq("id", complaint_id)
            .limit(1)
            .execute()
        )

        if not complaint.data:
            return jsonify({
                "success": False,
                "error": "Complaint not found"
            }), 404

        record = complaint.data[0]

        if str(record.get("user_id")) != str(user.id):
            return jsonify({
                "success": False,
                "error": "You cannot decide on this complaint"
            }), 403

        if record.get("status") != "Awaiting Citizen Confirmation":
            return jsonify({
                "success": False,
                "error": "This complaint is not awaiting confirmation"
            }), 400

        if not record.get("resolution_proof_url"):
            return jsonify({
                "success": False,
                "error": "Resolution proof is missing"
            }), 400

        new_status = (
            "Resolved" if decision == "accepted" else "In Progress"
        )

        result = (
            supabase.table("complaints")
            .update({"status": new_status})
            .eq("id", complaint_id)
            .execute()
        )

        if not result.data:
            return jsonify({
                "success": False,
                "error": "Could not save your decision"
            }), 500

        return jsonify({
            "success": True,
            "message": "Your decision has been recorded.",
            "complaint": result.data[0]
        }), 200

    except Exception as e:
        print("Resolution decision error:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------- RUN SERVER ----------------

if __name__ == "__main__":
    app.run(debug=True, port=5000)
