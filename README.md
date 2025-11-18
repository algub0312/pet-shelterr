# Pet Shelter Project

This repository contains **two separate assignments**:

- **Assignment 1:** Frontend (HTML/CSS/JS)
- **Assignment 2:** Backend (Django)

---

## Folder Structure

```
pet-shelter/
├── frontend_assignment/    # Assignment 1 (Frontend)
└── backend_assignment/     # Assignment 2 (Django Backend)
```

---

## Assignment 1 – Frontend

### Running the Frontend

1. Navigate to the frontend folder:

```bash
   cd frontend_assignment
```

2. Open with Live Server:
   - Right-click `index.html` in VS Code
   - Select **"Open with Live Server"**

---

## Assignment 2 – Django Backend

### Setup & Installation

1. Navigate to the backend folder:

```bash
   cd backend_assignment
```

2. Create a virtual environment (recommended):

```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
   pip install -r requirements.txt
```

4. Run migrations:

```bash
   python manage.py migrate
```

### Running the Server

```bash
python manage.py runserver
```

Visit: http://localhost:8000

### User Access

- **Username:** `user`
- **Password:** `Password1.`

### Admin Access

- **URL:** http://localhost:8000/admin
- **Username:** `admin`
- **Password:** `admin123`

---
