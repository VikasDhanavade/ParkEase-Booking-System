# 🚗 ParkEase: Full-Stack Parking Slot Booking and Management System

## 📝 Short Project Abstract
**ParkEase** is a comprehensive, web-based software system designed to simplify and automate the process of parking slot reservation and management. Built strictly using software logic (without IoT hardware dependencies), the system offers a complete lifecycle solution: users can instantly search for available parking slots across various lots, reserve slots for a specific duration, receive automated physical QR code receipts, and manage checkouts/cancellations. Concurrently, administrators have a powerful real-time dashboard to manage slots, dynamically set pricing (Bike vs. Car), view revenue metrics, and seamlessly track daily traffic natively. The system enforces zero double-bookings via backend database constraints and calculates overstay penalties natively.

---

## 🌟 Main Features List

### 👤 User Module
- **Secure Authentication:** JWT-based user registration and login interface.
- **Dynamic Lot Selection:** Live search functionality seamlessly rendering parking lots and real-time slot availability.
- **Smart Booking System:** Enforced 1-hour minimum duration, preventing over-booking and native collision constraints.
- **QR Code Booking Receipts:** Native QR codes uniquely generated upon booking confirmation.
- **My Bookings Dashboard:** A centralized digital ticket center to track upcoming, past, cancelled, and overstayed bookings.
- **Automated Overstay Penalties:** Tracks active checkouts natively; penalizes double rates dynamically if checked out late.

### 👑 Admin Module
- **Live Analytical Dashboard:** Real-time metrics counting Total Lots, Total Slots, Active Incoming Bookings, and Total System Revenue!
- **Parking Lot Management:** Create and edit locations dynamically, enforcing distinct native prices for `Cars` and `Bikes`.
- **Slot Capacity Oversight:** Effortlessly generate or block specific slots across floors.
- **Traffic Logging:** Monitor all global user bookings historically within a searchable datatable natively.
- **Security Alerts:** Automated virtual email relays triggered on logins and booking checkouts.

---

## 🛠️ Project Folder Structure
```text
Parking System Dapp/
│
├── backend/                  # Node.js + Express Backend Server
│   ├── config/              
│   │   └── db.js             # Mongoose connection logic
│   ├── controllers/         
│   │   ├── adminController.js # Handles admin analytics and lot creation
│   │   ├── authController.js  # JWT Login/Registration flows
│   │   ├── bookingController.js # Heavy lifting for time collisions and bookings
│   │   └── lotController.js   # Fetching lots and calculating slot availability
│   ├── middleware/          
│   │   └── auth.js            # JWT role-based token gating
│   ├── models/              
│   │   ├── Booking.js         # Stores duration, status, amount, qrCodeData
│   │   ├── ParkingLot.js      # Stores location, description, specific rates
│   │   ├── Slot.js            # Stores slot number, floor, status
│   │   └── User.js            # Stores credentials, role
│   ├── routes/              
│   │   ├── admin.js           
│   │   ├── auth.js            
│   │   ├── bookings.js        
│   │   └── lots.js            
│   ├── utils/               
│   │   └── email.js           # Automated Email Alerts (SMTP / Ethereal Sandbox)
│   ├── seed.js               # Dummy data generator for viva demo!
│   └── server.js             # Express application entrypoint
│
└── frontend/                 # Vanilla JS + Bootstrap Frontend App
    ├── css/                  
    │   └── style.css         # Clean, responsive internal design tokens
    ├── js/                   
    │   ├── api.js            # Global API fetch interceptors / local-storage auth
    │   └── auth.js           # Login DOM event hooks
    ├── admin.html            # Main Administrative Control Panel
    ├── bookings.html         # User Digital Receipt & QR Ticket Viewer
    ├── dashboard.html        # Main Search Engine & Space Reserver
    ├── login.html            # Centered Mobile-first Authentication
    ├── register.html         # Centered Mobile-first Registration
    └── index.html            # Landing / Entry
```

---

## 📜 Installation & Setup Steps (README)

### 1️⃣ Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (running locally on `mongodb://localhost:27017` or a cloud cluster)

### 2️⃣ Environment Setup
Create a file named `.env` inside the `/backend` folder:
```env
MONGO_URI=mongodb://localhost:27017/parking_db
JWT_SECRET=super_secret_jwt_key_here
PORT=5001

# (Optional) Place real App Passwords here to send physical emails over internet!
# SMTP_HOST=smtp.gmail.com
# SMTP_USER=vikasdhanavade2141@gmail.com
# SMTP_PASS=your_16_digit_app_password
```

### 3️⃣ Booting the Application
Open two separate Terminals in your root folder:

**Terminal 1 (Backend API):**
```bash
cd backend
npm install
node seed.js  # Run once to instantly populate dummy admins, lots, and slots!
npm run dev
```

**Terminal 2 (Frontend Server):**
```bash
npm run serve
```
Open **http://localhost:3000** in your browser!

### 4️⃣ Sample Demo Data Credentials
If you ran `node seed.js`, use these locally:
- **Admin**: `admin@park.com` | Password: `admin`
- **User**: `user@park.com` | Password: `user`

---

## 📊 Documentation for Academic Viva

### 1. ER Diagram Description
- **Users Table**: Connects `1:N` to the Bookings table. (One user can have multiple bookings).
- **ParkingLots Table**: Connects `1:N` to the Slots table. (One parking lot holds multiple distinct slots).
- **Slots Table**: Connects `1:N` to the Bookings table. (A physical slot has many historical bookings assigned across time).
- **Bookings Table**: The associative entity linking Users, Lots, and Slots securely with enforced start/end timestamps.

### 2. Use Case Description
- **Use Case 1 (Booking):** An authenticated `User` selects a parking lot. The system calculates availability by scanning the `Bookings` model for overlapping timestamps. The user inputs their vehicle, duration, and confirms. The system calculates cost natively, sets the `Slot` as 'Active', and dynamically creates a QR code string.
- **Use Case 2 (Checkout/Penalty):** The user returns to their dashboard and clicks "Checkout Now". The system evaluates current server time vs `endTime`. If the user overstayed, the application natively levies a double-rated penalty fee calculated precisely over the overstay duration before closing the loop to 'Completed'.

### 3. Core API List
- **POST `/api/auth/register`** - Registers a basic user or admin.
- **POST `/api/auth/login`** - Authenticates and issues JWT token alongside an email alert.
- **GET `/api/lots`** - Retrieves total available parking complexes securely.
- **GET `/api/lots/:id/slots?startTime=X&endTime=Y`** - Evaluates physical availability algorithm natively.
- **POST `/api/bookings`** - Safely validates time intersections, inserts a booking record locally, and triggers Email/QR sequences.
- **GET `/api/bookings/me`** - Serves historical/active QR data solely to the authenticated user.
- **PATCH `/api/bookings/:id/checkout`** - Verifies overstay penalty conditions.
- **GET `/api/admin/stats`** - Serves real-time aggregation algorithms across all collections securely.

### 4. Future Scope
- **Payment Gateway Integration:** Implementation of Stripe/Razorpay for immediate online financial clearance (currently mocks simple payment logic).
- **Map Box API Integration:** Showing physical coordinates of parking lots seamlessly on a native geographic map.
- **Hardware Integration Swap:** If the budget allowed, attaching real IoT ultrasonic sensors to the `status` schema of the `Slot` table to physically verify a car exists in the spot locally.
