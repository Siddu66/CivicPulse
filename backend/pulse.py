
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

app = Flask(__name__)
CORS(app)

# Connect to Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
print("Key type:", supabase_key[:15] if supabase_key else "MISSING")

supabase: Client | None = None

if supabase_url and supabase_key:
    supabase = create_client(supabase_url, supabase_key)
    print("Supabase connected successfully!")
else:
    print("Supabase credentials not found. Check your .env file.")

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

@app.route("/api/complaints", methods=["GET"])
def get_complaints():
    if supabase is None:
        return jsonify({
            "success": False,
            "error": "Database not connected"
        }), 500

    try:
        query = supabase.table("complaints").select("*")

        # Read filter values from URL
        status = request.args.get("status")
        category = request.args.get("category")
        priority = request.args.get("priority")

        # Apply filters only when provided
        if status:
            query = query.eq("status", status)

        if category:
            query = query.eq("category", category)

        if priority:
            query = query.eq("priority", priority)

        response = query.order(
            "created_at", desc=True
        ).execute()

        return jsonify({
            "success": True,
            "complaints": response.data
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    
from flask import request

@app.route("/api/complaints", methods=["POST"])
def create_complaint():
    if supabase is None:
        return jsonify({"success": False, "error": "Database not connected"}), 500

    data = request.get_json(silent=True) or {}

    title = data.get("title")
    description = data.get("description")
    category = data.get("category")

    if not title or not description:
     return jsonify({
        "success": False,
        "error": "Title and description are required"
    }), 400

    try:
        response = supabase.table("complaints").insert({
            "title": title,
            "description": description,
            "category": category or None,
            "location": data.get("location")
        }).execute()

        return jsonify({
            "success": True,
            "message": "Complaint submitted successfully!",
            "complaint": response.data[0]
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/complaints/<int:complaint_id>/ai-suggestion", methods=["POST"])
def save_ai_suggestion(complaint_id):
    if supabase is None:
        return jsonify({
            "success": False,
            "error": "Database not connected"
        }), 500

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
        response = supabase.table("complaints").update({
            "ai_category": ai_category,
            "ai_priority": ai_priority,
            "category_confidence": confidence
        }).eq("id", complaint_id).execute()

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

@app.route("/api/complaints/<int:complaint_id>/approve", methods=["PUT"])
def approve_complaint(complaint_id):
    if supabase is None:
        return jsonify({
            "success": False,
            "error": "Database not connected"
        }), 500

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
        response = supabase.table("complaints").update({
            "category": approved_category,
            "admin_verified_category": approved_category,
            "priority": approved_priority
        }).eq("id", complaint_id).execute()

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

    
@app.route("/api/complaints/<int:complaint_id>", methods=["PUT"])
def update_complaint(complaint_id):
    if supabase is None:
        return jsonify({
            "success": False,
            "error": "Database not connected"
        }), 500

    data = request.get_json(silent=True) or {}
    new_status = data.get("status")

    allowed_statuses = ["Pending", "In Progress", "Resolved", "Rejected"]

    if new_status not in allowed_statuses:
        return jsonify({
            "success": False,
            "error": "Invalid status"
        }), 400

    try:
        response = supabase.table("complaints").update({
            "status": new_status
        }).eq("id", complaint_id).execute()

        if not response.data:
            return jsonify({
                "success": False,
                "error": "Complaint not found"
            }), 404

        return jsonify({
            "success": True,
            "message": "Complaint status updated successfully!",
            "complaint": response.data[0]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/complaints/<int:complaint_id>/history", methods=["GET"])
def get_complaint_history(complaint_id):
    if supabase is None:
        return jsonify({
            "success": False,
            "error": "Database not connected"
        }), 500

    try:
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

@app.route("/api/admin/stats", methods=["GET"])
def get_admin_stats():
    if supabase is None:
        return jsonify({
            "success": False,
            "error": "Database not connected"
        }), 500

    try:
        response = supabase.table("complaints").select(
            "status, priority"
        ).execute()

        complaints = response.data

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
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    
if __name__ == "__main__":
    app.run(debug=True, port=5000)
