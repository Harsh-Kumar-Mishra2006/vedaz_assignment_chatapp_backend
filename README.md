# 💬 Real-Time Chat Application - Backend

A scalable **Real-Time Chat Application Backend** built using **Node.js**, **Express.js**, **MongoDB**, and **Socket.IO**. This backend provides REST APIs for retrieving and storing chat messages while enabling real-time communication between connected users using WebSockets.

---

## 📌 Features

- ⚡ Real-time messaging using Socket.IO
- 💾 Persistent chat history stored in MongoDB
- 📜 Retrieves last 50 chat messages
- ✍️ Live typing indicator
- 🔄 Automatic message broadcasting
- 🛡️ Helmet security middleware
- 🚦 Express Rate Limiting
- 🌐 CORS enabled
- 📡 Health Check API
- 🧹 Clean MVC Folder Structure
- 🔌 Socket.IO Integration
- 📱 REST API fallback for message storage

---

# 🛠 Tech Stack

| Technology         | Purpose                 |
| ------------------ | ----------------------- |
| Node.js            | Runtime Environment     |
| Express.js         | Backend Framework       |
| MongoDB            | Database                |
| Mongoose           | ODM                     |
| Socket.IO          | Real-time Communication |
| Helmet             | Security Headers        |
| Express Rate Limit | API Rate Limiting       |
| CORS               | Cross-Origin Requests   |
| dotenv             | Environment Variables   |

---

# 📁 Project Structure

```
backend/
│
├── config/
│   └── Database.js          # MongoDB Connection
│
├── controllers/
│   └── messageControllers.js # REST API Controllers
│
├── models/
│   └── Message.js           # MongoDB Schema
│
├── routes/
│   └── messageRoutes.js     # API Routes
│
├── socket/
│   └── socketHandler.js     # Socket.IO Events
│
├── .env
├── package.json
├── README.md
└── Server.js
```

---

# 🏗 Backend Architecture

```
                Client (React)
                     │
        ┌────────────┴────────────┐
        │                         │
 REST API                    Socket.IO
        │                         │
        ▼                         ▼
+-----------------------------------------+
|             Express Server              |
|                                         |
| Helmet                                 |
| CORS                                   |
| Rate Limiter                           |
| Express Middleware                     |
+-----------------------------------------+
        │                     │
        │                     │
        ▼                     ▼
 Message Routes         Socket Handler
        │                     │
        ▼                     ▼
 Message Controller   Real-time Events
        │                     │
        └──────────────┬──────┘
                       ▼
               Message Model
                       │
                       ▼
                  MongoDB Database
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone <https://github.com/Harsh-Kumar-Mishra2006/vedaz_assignment_chatapp_backend>
```

Move inside backend

```bash
cd backend
```

Install dependencies

```bash
npm install
```

---

# ▶️ Running the Server

Using Node

```bash
node Server.js
```

Using Nodemon

```bash
nodemon Server.js
```

Expected Output

```
MongoDB connected successfully

Server running on port 3000

Socket.io server is ready
```

---

# 📡 REST API Endpoints

## Get Previous Messages

```
GET /api/messages
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "username": "Harsh",
      "message": "Hello",
      "userId": "123",
      "timestamp": "2026-07-01T18:30:00.000Z"
    }
  ]
}
```

---

## Save New Message

```
POST /api/messages
```

### Request Body

```json
{
  "username": "Harsh",
  "message": "Hello Everyone",
  "userId": "12345"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "username": "Harsh",
    "message": "Hello Everyone",
    "userId": "12345",
    "timestamp": "2026-07-01T18:30:00.000Z"
  }
}
```

---

# ❤️ Health Check

```
GET /health
```

Response

```json
{
  "status": "OK",
  "timestamp": "2026-07-01T18:30:00.000Z"
}
```

---

# ⚡ Socket.IO Events

## Client → Server

### new_message

```javascript
socket.emit("new_message", {
  username: "Harsh",
  message: "Hello World",
  userId: "123",
});
```

---

### typing

```javascript
socket.emit("typing", {
  username: "Harsh",
});
```

---

### stop_typing

```javascript
socket.emit("stop_typing", {
  username: "Harsh",
});
```

---

# Server → Client

## previous_messages

Sent immediately after a user connects.

```javascript
socket.on("previous_messages", (messages) => {});
```

---

## message_received

Broadcast whenever a new message is stored successfully.

```javascript
socket.on("message_received", (message) => {});
```

---

## user_typing

Broadcast when another user starts or stops typing.

```javascript
socket.on("user_typing", (data) => {});
```

Example

```json
{
  "username": "Harsh",
  "isTyping": true
}
```

---

## error

```javascript
socket.on("error", (message) => {});
```

---

# 🗄 Database Schema

```javascript
Message
│
├── username : String
├── message  : String
├── userId   : String
└── timestamp: Date
```

---

# 🔄 Request Flow

## Fetch Messages

```
Client
   │
GET /api/messages
   │
Routes
   │
Controller
   │
MongoDB
   │
Response
```

---

## Send Message (Socket)

```
Client

      │
new_message

      │

Socket Handler

      │

Validate Payload

      │

Save to MongoDB

      │

Broadcast

      │

All Connected Clients
```

---

# 🔐 Security Features

- Helmet Security Middleware
- Express Rate Limiting
- CORS Enabled
- Environment Variables using dotenv
- Input Validation
- Error Handling
- Secure MongoDB Connection

---

# 📦 Dependencies

```
bcryptjs
cors
dotenv
express
express-rate-limit
helmet
jsonwebtoken
mongoose
nodemon
path
socket.io
```

---

# 🚀 Future Improvements

- User Authentication (JWT)
- Online/Offline User Status
- Private Messaging
- Group Chats
- Read Receipts
- Message Deletion
- Media/File Sharing
- Image Upload Support
- Redis Adapter for Horizontal Scaling
- Docker Support

---

# 👨‍💻 Author

**Harsh Kumar Mishra**

Built using **Node.js**, **Express.js**, **MongoDB**, and **Socket.IO**.
