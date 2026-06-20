# 🧠 BrainCache

> A full-stack note-taking application with image/file uploads, tags, pinning, archiving, and an AI chat assistant powered by Google Gemini.

---

## 🎥 Demo


https://github.com/user-attachments/assets/a0ca1441-19ef-4914-a010-a3678709f839



https://github.com/user-attachments/assets/70513e13-bc51-44ab-8562-eca92ba07725



---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, React Router, Lucide React, Vanilla CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL |
| **Auth** | JWT (JSON Web Tokens) |
| **File Storage** | Cloudinary + Multer |
| **AI Service** | Google Gemini API |
| **Build Tool** | Vite |

---

## ✨ Features

### 🔐 Authentication
- JWT-based login & registration
- Protected routes (PrivateRoute / PublicRoute)

### 📝 Notes Management
- Create, edit, delete notes
- Support for **Text**, **Image**, **Link**, and **File** note types

### 🏷️ Tags System
- Custom tags with color-coded labels
- Filter notes by tag from the sidebar

### 📌 Productivity Features
- Pin important notes to the top
- Archive / unarchive notes
- Real-time search & type filter

### ☁️ File Uploads
- Image / file upload via **Cloudinary + Multer** (memoryStorage)
- Secure cloud storage with auto CDN URL

### 🤖 AI Chat (NEW)
- Global AI chat assistant available on all pages via sidebar
- Automatically loads all your notes as context
- Reference any note by name — *"I have a question about my React Hooks note"*
- Ask questions, get summaries, expand ideas, discuss anything you've saved
- Powered by **Google Gemini API** via native REST (no SDK)

---

## 🚀 Setup & Run

### 📌 Prerequisites
- Node.js v18+
- MySQL running locally
- Cloudinary account *(free tier works)*
- Gemini API key → [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

### 🗄️ 1. Database Setup

Open MySQL Workbench and run:

```sql
CREATE DATABASE braincache;
```

> All tables (`users`, `notes`, `tags`, `note_tags`) are auto-created on first backend start.

---

### ⚙️ 2. Backend Setup

```bash
cd backend
npm install
```

Fill in your `backend/.env`:

```env
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

GEMINI_API_KEY=your_gemini_api_key_here

CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev    # development (nodemon)
npm start      # production
```

Backend → `http://localhost:5000`

---

### 💻 3. Frontend Setup

```bash
cd frontend
npm install
```

Fill in your `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

Frontend → `http://localhost:5173`

---

## 📁 Project Structure

```
BrainCache/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MySQL pool connection
│   │   ├── initDB.js              # Auto-create tables on startup
│   │   ├── cloudinary.js          # Multer memoryStorage + upload helper
│   │   └── gemini.js              # Gemini REST API URL config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── noteController.js
│   │   ├── tagController.js
│   │   ├── uploadController.js
│   │   └── chatController.js      # AI chat with notes context
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verify
│   ├── models/
│   │   ├── userModel.js
│   │   ├── noteModel.js
│   │   └── tagModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── noteRoutes.js
│   │   ├── tagRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── chatRoutes.js          # POST /api/chat
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx          # Sidebar + Outlet shell
    │   │   ├── NoteCard.jsx
    │   │   ├── NoteModal.jsx
    │   │   ├── TagsModal.jsx
    │   │   └── ToastContainer.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useToast.js
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ArchivePage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   └── ChatPage.jsx        # AI Chat UI
    │   ├── styles/
    │   │   └── global.css
    │   ├── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── .env
    └── package.json
```

---

## 🧠 API Endpoints

### 🔐 Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Get current user 🔒 |
| `PUT` | `/api/auth/profile` | Update profile 🔒 |

### 📝 Notes
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notes` | Get all notes (search, type, tag filter) 🔒 |
| `GET` | `/api/notes/archived` | Get archived notes 🔒 |
| `GET` | `/api/notes/:id` | Get single note 🔒 |
| `POST` | `/api/notes` | Create note (+ file upload) 🔒 |
| `PUT` | `/api/notes/:id` | Update note 🔒 |
| `DELETE` | `/api/notes/:id` | Delete note 🔒 |
| `PATCH` | `/api/notes/:id/pin` | Toggle pin 🔒 |
| `PATCH` | `/api/notes/:id/archive` | Toggle archive 🔒 |

### 🏷️ Tags
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tags` | Get all tags 🔒 |
| `POST` | `/api/tags` | Create tag 🔒 |
| `PUT` | `/api/tags/:id` | Update tag 🔒 |
| `DELETE` | `/api/tags/:id` | Delete tag 🔒 |

### ☁️ Upload
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload/avatar` | Upload profile avatar 🔒 |
| `POST` | `/api/upload/file` | Upload note file/image 🔒 |

### 🤖 AI Chat
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Chat with AI using your notes as context 🔒 |

> 🔒 = Requires `Authorization: Bearer <token>` header

---

## 🎯 Future Improvements

- [ ] 🎙️ Voice-to-note input
- [ ] 🏷️ AI auto-tagging
- [ ] 🔍 Smart semantic search
- [ ] 👥 Collaboration / shared notes
- [ ] 📱 Mobile app (React Native)
