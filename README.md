# CivicPulse – Community Problem Reporting & Resolution Platform

**Turning local complaints into accountable action.**

CivicPulse is a web-based civic issue reporting and resolution platform that connects citizens with local administrators. It allows citizens to report community problems, track complaint progress and verify resolutions, while administrators can manage complaints based on their assigned locations.

---

## 1. Problem Statement

Citizens often face difficulties reporting civic issues such as damaged roads, garbage accumulation, drainage problems and other public infrastructure concerns.

Traditional reporting methods can lack:
- Centralized complaint management.
- Transparency in complaint status.
- Clear responsibility for local authorities.
- Evidence of completed work.
- Citizen confirmation of resolution.

CivicPulse addresses these challenges through a centralized, location-aware digital platform.

## 2. Proposed Solution

CivicPulse provides a structured workflow:

**Citizen Report → Location-Based Routing → Administrator Action → Resolution Proof → Citizen Confirmation**

The platform promotes transparency, accountability and efficient complaint management.

## 3. Key Features

### Citizen Module
- Secure registration and login.
- Submit civic complaints with descriptions and images.
- GPS-based incident location detection.
- OpenStreetMap location preview.
- Select incident district, area and ward.
- Track complaint status and history.
- View administrator-uploaded resolution proof.
- Accept or reject a proposed resolution.

### Administrator Module
- Secure administrator login.
- View complaints belonging to the assigned district, area and ward.
- Review complaint category and priority suggestions.
- Assign complaints and update their status.
- Correct complaint information and location.
- Upload resolution proof.
- Monitor complaint statistics.

### Super Administrator Module
- Platform-wide complaint visibility.
- Monitor complaints across different locations.
- Support overall administrative oversight.

### Smart Assistance
- Keyword-based category and priority suggestions.
- Department mapping based on complaint categories.
- Administrator review and correction of suggestions.

*Note: The current smart classification feature uses keyword-based logic; it is not a trained machine-learning model.*

## 4. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 19 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend | Python, Flask |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| Maps | OpenStreetMap |
| API Communication | REST API |

## 5. System Workflow

1. A citizen registers and logs in.
2. The citizen submits a complaint with its description, image and incident location.
3. The system stores the complaint and its location details.
4. The responsible local administrator views the complaint based on the incident district, area and ward.
5. The administrator reviews, assigns and updates the complaint.
6. After completing the work, the administrator uploads resolution proof.
7. The complaint moves to **Awaiting Citizen Confirmation**.
8. The citizen reviews the proof and either accepts or rejects the resolution.
9. If accepted, the complaint becomes **Resolved**. If rejected, it returns to **In Progress**.

## 6. Location-Based Complaint Management

CivicPulse routes complaints according to the actual location of the reported issue rather than the citizen's registered address.

For example:

A citizen registered in Ward 5 reports a damaged road in Ward 12. The complaint is routed to the administrator responsible for Ward 12.

This helps ensure that complaints reach the appropriate local authority.

## 7. Project Structure

```text
CivicPulse/
│
├── backend/
│   ├── pulse.py
│   └── .env
│
├── src/
│   ├── components/
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── AdministratorDashboard.jsx
│   │   ├── Auth.jsx
│   │   ├── CitizenHome.jsx
│   │   ├── ReportIssue.jsx
│   │   ├── RoleSelection.jsx
│   │   ├── TrackIssues.jsx
│   │   └── Welcome.jsx
│   ├── App.jsx
│   └── index.css
│
├── index.html
├── package.json
├── tailwind.config.js
└── README.md
```

## 8. Installation and Setup

### Prerequisites
- Node.js and npm
- Python 3
- Supabase account
- Git

### Step 1: Clone the repository

```bash
git clone https://github.com/Siddu66/CivicPulse.git
cd CivicPulse
```

### Step 2: Install frontend dependencies

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Set up the backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
venv\Scripts\activate
```

Install the backend dependencies:

```bash
pip install flask flask-cors python-dotenv supabase
```

Create `backend/.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
```

**Important:** Never expose or commit the Supabase service role key. Keep environment files private.

### Step 4: Start the backend

From the `backend` directory:

```bash
python pulse.py
```

The Flask backend runs at:

```text
http://127.0.0.1:5000
```

### Step 5: Start the frontend

Open another terminal in the project root:

```bash
npm run dev
```

Open the local Vite URL displayed in the terminal, usually:

```text
http://localhost:5173
```

## 9. Supabase Configuration

CivicPulse uses Supabase for authentication, PostgreSQL database management and file storage.

Required configuration includes:
- Complaint records and incident location fields.
- User profiles and role information.
- Complaint status history.
- Appropriate database Row Level Security policies.
- `complaint-images` storage bucket.
- `resolution-proofs` storage bucket.

The resolution proof bucket is configured as private.

The database schema and access policies must be configured before running the complete application.

## 10. Security and Access Control

- Authenticated access to protected operations.
- Role-based access for citizens, administrators and super administrators.
- Citizens can access their own complaints.
- Local administrators are restricted to their assigned incident locations.
- Super administrators have platform-wide access.
- Supabase Row Level Security supports database-level access protection.
- Environment secrets are excluded from source control.

## 11. Future Scope

The following features are proposed for future development and are not claimed as implemented.

### Emergency Response Integration
- Dedicated emergency complaint reporting.
- Integration with authorized emergency services.
- Escalation and response tracking.

### NLP and Advanced AI
- Natural Language Processing for understanding complaints.
- Improved automatic classification and priority detection.
- Duplicate complaint detection.
- Predictive analysis of recurring civic issues.

### Multilingual Support
- Kannada, English and other regional languages.
- Automatic translation.
- Voice-based complaint submission.
- Speech-to-text support.

### Graphical Analytics
- Ward-wise complaint statistics.
- Category-wise complaint distribution.
- Monthly and yearly complaint trends.
- Resolution rates and average resolution time.
- Geographic complaint heatmaps.

## 12. Expected Impact

CivicPulse aims to:
- Make civic issue reporting more accessible.
- Improve communication between citizens and administrators.
- Encourage location-based responsibility.
- Increase transparency in complaint resolution.
- Build trust through evidence-based closure and citizen confirmation.

## 13. Team

**Project:** CivicPulse  
**Repository:** https://github.com/Siddu66/CivicPulse

Team members and individual contributions:

- Siddharud R Malali – Backend
- Prajwal – AI complaint categorization and backend
- Abhiram – Frontend
- Narendra – Frontend

## 14. Conclusion

CivicPulse transforms traditional civic complaint reporting into a structured digital workflow. By combining location-aware complaint management, administrator accountability and citizen-verified resolution, the platform aims to support cleaner, safer and more responsive communities.

**CivicPulse – Report Clearly. Resolve Transparently. Build Better Communities.**
