# 🗳️ SecureVote – Online Voting System

A full-stack MERN application for conducting secure digital elections with user authentication, admin control, complaint management, and email notifications.

---

## 🚀 Live Demo

👉 (Add your deployed link here after deployment)

---

## 📌 Features

### 👤 User Features

* User registration and login
* Secure authentication using JWT
* Vote only once (prevents duplicate voting)
* Search and filter candidates by name, party, and state
* Raise complaints during elections
* View complaint status
* Receive email after successful vote

---

### 👨‍💼 Admin Features

* Add candidates dynamically (name, party, symbol, state)
* View all candidates with party logos
* Manage and resolve user complaints
* Monitor election process

---

### 🔒 Security Features

* JWT-based authentication
* One-time voting restriction
* Protected admin routes
* Backend validation for secure voting

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Axios
* Bootstrap / CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### Other Tools

* Nodemailer (Email notifications)

---

## 📂 Project Structure

online-voting-system/
│
├── frontend/        # React frontend
├── backend/         # Node.js backend
└── README.md

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```bash id="bkv79c"
git clone https://github.com/YOUR_USERNAME/online-voting-system.git
cd online-voting-system
```

---

### 2️⃣ Backend Setup

```bash id="jfrb5m"
cd backend
npm install
npm run dev
```

Create `.env` file:

```env id="4vb3g9"
MONGODB_URI=your_mongodb_uri
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
PORT=5000
```

---

### 3️⃣ Frontend Setup

```bash id="p5qfda"
cd frontend
npm install
npm start
```

Create `.env` file:

```env id="a1eymd"
REACT_APP_API_BASE_URL=http://localhost:5000
```

---

## 🧪 Usage Flow

1. Register a new account
2. Login securely
3. View candidates based on state
4. Vote for a candidate (only once)
5. Receive vote confirmation email
6. Raise complaints if issues occur
7. Admin reviews and resolves complaints

---

## 🎯 Future Improvements

* Real-time voting updates
* Advanced analytics dashboard
* Multi-election support
* Enhanced UI/UX design

---

## 👨‍💻 Author

**Naveen Kandula**
B.Tech CSE

---

## 📜 License

This project is for educational purposes.
