🧠 BrainCache
A full-stack note-taking application with image/file uploads, tags, pinning, archiving, AI summarization, and PDF export.
🎥 Demo
(Add your screen recording here if needed) `Screen.Recording.2026-03-18.104205.mp4`
⚙️ Tech Stack
Frontend: React.js, React Router, Lucide React, Vanilla CSS Backend: Node.js, Express.js Database: MySQL Auth: JWT (JSON Web Tokens) File Storage: Cloudinary + Multer AI Service: Google GenAI / OpenAI (via `aiController`) PDF Generation: (PDFKit / jsPDF / Puppeteer) Build Tool: Vite
✨ Features
🔐 Authentication

* JWT-based login & registration
* Protected routes
📝 Notes Management

* Create, edit, delete notes
* Support for:
   * Text notes
   * Image notes
   * Link notes
   * File attachments
🏷 Tags System

* Custom tags
* Color-coded labels
* Filter notes by tags
📌 Productivity Features

* Pin important notes
* Archive/unarchive notes
* Search & filter functionality
☁ File Uploads

* Image/file upload via Cloudinary + Multer
* Secure cloud storage
🤖 AI Features (NEW)
✨ AI Summarization

* Generate concise summaries of long notes
* Works for both text and image-based notes
* Helps quickly extract key insights
📄 Export Notes as PDF

* Export notes into downloadable PDF files
* Supports:
   * Text notes
   * Image notes
* Includes:
   * Title
   * Content
   * AI-generated summary (if enabled)
   * Attached images (for image notes)
   * With the Tags
🚀 Setup & Run
📌 Prerequisites

* Node.js v18+
* MySQL running locally
* Cloudinary account (free tier works)
* AI API key (Google GenAI or OpenAI)
🗄 1. Database Setup
Open MySQL and run:

```

```


```
CREATE DATABASE braincache;
```

Tables are auto-created when backend starts.
⚙️ 2. Backend Setup

```

```


```
cd backend
npm install
```

Create `.env` file:

```

```


```
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=braincache

JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI CONFIG
GEMINI_API_KEY=your_ai_key_here
# or OPENAI_API_KEY=your_openai_key_here

CLIENT_URL=http://localhost:5173
```

Run backend:

```

```


```
npm run dev   # development
npm start     # production
```

Backend runs at:

```

```


```
http://localhost:5000
```

💻 3. Frontend Setup

```

```


```
cd frontend
npm install
```

Create `.env`:

```

```


```
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```

```


```
npm run dev
```

Frontend runs at:

```

```


```
http://localhost:5173
```

📁 Project Structure

```

```


```
BrainCache/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   ├── initDB.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── noteController.js
│   │   ├── tagController.js
│   │   ├── uploadController.js
│   │   └── aiController.js        # NEW
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── noteModel.js
│   │   └── tagModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── noteRoutes.js
│   │   ├── tagRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── aiRoutes.js           # NEW
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── pages/
    │   ├── styles/
    │   ├── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── .env
    └── package.json
```

🧠 API Endpoints (AI)
✨ Summarize Note

```

```


```
POST /api/ai/summarize
```

Body:

```

```


```
{
  "content": "Your note content here"
}
```

📄 Export Note as PDF

```

```


```
POST /api/ai/export-pdf
```

Body:

```

```


```
{
  "noteId": 1
}
```
*  Collaboration / shared notes 
*  Mobile app (React Native) 
give me this in the ReadMe so i can put it in my repo
