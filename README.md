##🎬 Movie Ticket Booking System

A full-stack web app for booking movie tickets, built with React, Node.js (Express), and SQLite.

###🚀 Live Links

Frontend: https://movie-ticket-booking-frontend-lo92.onrender.com

Backend: https://movie-ticket-booking-backend.onrender.com

🧩 Tech Stack

Frontend: React, React Router, CSS

Backend: Node.js, Express.js, SQLite3, JWT, bcrypt

Hosting: Render (both frontend & backend)

⚙️ Run Locally
Backend
cd backend
npm install
node server.js


Runs on: http://localhost:4000

Frontend
cd frontend
npm install
npm start


Runs on: http://localhost:3000

Update API in frontend to:

const API = "https://movie-ticket-booking-backend.onrender.com/api";

🛠️ Deployment (Render)

Backend

Build: npm install

Start: node server.js

Add env: JWT_SECRET=yourkey

Frontend

Add in package.json: "homepage": "."

Add in public/_redirects:

/* /index.html 200


Build: npm run build

Publish Directory: build

✨ Features

User registration & login (JWT auth)

Browse movies & showtimes

Seat selection and booking

Booking history view

Responsive UI

Author: Aryan Tambekar
GitHub: @Aryan-Tambekar
