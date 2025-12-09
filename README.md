# Areto — Quiz & Flashcard Study Web App

Areto is a full-stack study platform built as a **Senior Software Development Capstone Project**.  
It helps users learn through **flashcards**, **quizzes**, and **custom study sets** created by either the user or an administrator.

The design and functionality draw inspiration from:
- **Quizlet**
- **Kahoot**
- **You Can’t Do Simple Maths Under Pressure**

Areto emphasizes simplicity, speed, and an enjoyable study experience.

---

## 🚀 Tech Stack

### **Frontend**
- React (MERN)
- Tailwind CSS
- DaisyUI
- React Hot Toast
- Clerk (authentication)

### **Backend**
- Node.js
- Express
- MongoDB (Mongoose)
- Upstash (rate limiting / Redis)
- Postman (API development & testing)

### **Deployment**
- Render (frontend + backend)

### **AI Tools Used During Development**
- ChatGPT  
- Claude  
- Lovable  
- Bolt  

These tools supported code suggestions, debugging, documentation assistance, and rapid prototyping.

---

## ✨ Features

- Create, edit, and delete **flashcards**
- Build custom **quiz sets**
- Self-grading quizzes with instant feedback
- User & admin roles
- Secure authentication with Clerk
- Upstash-powered rate-limited API
- Responsive UI with Tailwind + DaisyUI
- Toast notifications for smooth UX
- REST API tested with Postman

---

## 🧠 How It Works

1. Users sign up or log in with Clerk  
2. Create flashcards or full quiz sets  
3. Take interactive quizzes  
4. View automatic grading results  
5. Edit, reuse, or manage study sets anytime  


---

## 📂 Project Structure (MERN)

areto/ <br>
├── frontend/ # React frontend <br>
├── backend/ # Express backend <br>
├── .gitignore <br>
└── LICENSE.md <br>
└── README.md <br>
└── package-lock.json <br>
└── package.json <br>

---

## 🛠️ Setup & Installation

### **1. Clone the repository**
- bash
- git clone https://github.com/your-username/areto.git
- cd areto

### 2. Install dependencies
**Client:**
- cd client
- npm install

**Server:**
- cd ../server
- npm install

### 3. Environment variables

Create .env files for both client and server.

Variables typically include:

MongoDB URI

Clerk frontend & backend keys

Upstash Redis / rate limiter keys

JWT or session secrets

### 4. Run locally
Client:
npm run dev

Server:
npm run dev

## 📦 Deployment

Areto is deployed on Render:

- Frontend: Static React deployment
- Backend: Node/Express service
- Environment variables stored securely on Render
- Upstash Redis integrated for rate limiting

## 📜 License

[MIT License](https://github.com/emreejensen/areto/blob/main/LICENSE)

## 📧 Contact

For more information or questions about this project, feel free to reach out and contact me using the information below.
- <EmreeJensen2002@gmail.com>
- [Emree Jensen LinkedIn](https://www.linkedin.com/in/emreejensen/)
