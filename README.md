#  BursaryBot – AI Student Bursary Finder System

## Project Overview

BursaryBot is an AI-powered web application developed to help South African students find bursary opportunities that match their academic profile. The system allows students to register, create a profile, chat with an AI assistant for bursary guidance, and browse available bursaries.


---

## Features

* Student registration and login
* Secure authentication using JWT
* Student profile management
* AI-powered bursary assistant using Groq AI
* View available bursaries
* Chat history
* Cloud-hosted MySQL database
* Responsive web interface

---

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MySQL
* Aiven Cloud Database

### AI
- Groq API
- AI chatbot for bursary assistance

### Deployment

* Render

---

## Project Structure

```
BursaryBot/
│
├── BBot/                 # Frontend pages
├── server/               # Backend API
├── package.json
├── README.md
└── .gitignore
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Oluhle080/BursaryBot.git
```

Open the project folder:

```bash
cd BursaryBot
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and add the required environment variables.

Start the server:

```bash
npm start
```

The application will run on:

```
http://localhost:5000
```

---

## Environment Variables

Create a `.env` file with the following variables:

```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=

GROQ_API_KEY=
```


---

## Live Demo

Render Deployment:

https://bursarybot.onrender.com

GitHub Repository:

https://github.com/Oluhle080/BursaryBot

🔗 Aiven Console:
https://console.aiven.io/
---

## Team Members

 Group Members
 NN Ndimande-22330918
O Luthuli-22325286
S Nombika-22312280
QC Mtshali-22364740
SS Ngobese-22335678

---

## Future Improvements

* AI bursary recommendation engine
* Automatic bursary matching
* Document upload and verification
* Email notifications
* Saved bursaries
* Student dashboard improvements

---

