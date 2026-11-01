# KindWave — Modern Fundraiser & Crowdfunding Platform (MERN Stack)

A complete, production-grade, full-stack crowdfunding and charitable giving platform inspired by real-world charity systems like GoFundMe and Milaap. Built using the modern **MERN** stack (MongoDB, Express.js, React.js with Vite, and Node.js) with a warm, trustworthy charity UI powered by Tailwind CSS and Lucide icons.

---

## 🌟 Project Highlights & Features

- **Warm, Trustworthy Design System**: Deep forest green (`#1B4332`), soft off-white cream backgrounds (`#FAF9F6`), and warm orange accents (`#E07A5F`).
- **Real-Time Dynamic Ledger**: Campaign funds, progress percentage, donor count, and remaining targets are calculated and validated directly from database records.
- **Simulated Demo Donation Flow**: Includes preset contribution pills ($10, $25, $50, $100, $250, $500) and custom inputs, anonymous donation toggle, demo payment channel simulator, and printable digital tax-exempt receipt with unique transaction IDs (`DEMO-TXN-...`).
- **Comprehensive Campaign Exploration**:
  - Full-text search across campaign titles and descriptions.
  - Category filtering across **Medical**, **Education**, **Environment**, **Animal Welfare**, **Community**, and **Emergency**.
  - Status filtering (**Active**, **Completed**).
  - Sorting by **Newest**, **Most Funded**, **Ending Soon**, and **Goal Amount**.
- **Campaign Organizer Tools**:
  - Stepped campaign launch form with live card preview.
  - Curated high-resolution Unsplash charity photo selector or custom image URLs.
  - Full editing and deletion authorization (only campaign creators or administrators can modify).
  - Post campaign milestone updates directly to the campaign updates timeline.
- **User Dashboard**:
  - Personal profile summary and metrics (Total Contributed, Raised by You, Active Campaigns count).
  - "My Campaigns" table with live status badges and management actions.
  - "My Donations" history with digital receipt modal view.
- **Strict Administrator Oversight Console**:
  - Restrict access to authorized platform administrators on both the frontend and backend.
  - Platform KPIs: Total Funds Raised, Total Campaigns, Registered Users, and Total Donations.
  - Moderate campaigns (Approve / Set Active, Pending, Completed, Rejected, or Delete).
  - Registered user directory and donation transaction audit trail.
- **Robust Security**:
  - Passwords hashed using `bcryptjs` with salt rounds.
  - Stateless authentication with JSON Web Tokens (JWT).
  - Axios interceptors automatically injecting Bearer tokens.
  - Backend authorization middleware verifying token identity and admin roles.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, React Router DOM v6, Tailwind CSS v3, Lucide React Icons, Axios |
| **Backend** | Node.js (v24), Express.js (v4), RESTful API Architecture, CORS, Dotenv |
| **Database** | MongoDB (v8) with Mongoose ODM (Schemas, Virtuals, Pre-hooks, Aggregation Pipelines) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`) |
| **Styling & UX** | Custom Tailwind Color Tokens, Responsive Layouts, Skeletal Loading States, Custom Animated Toast System |

---

## 📁 Project Folder Structure

```text
fundraiser-platform/
├── client/                               # Frontend React + Vite application
│   ├── public/                           # Static assets
│   ├── src/
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── AdminRoute.jsx            # Protected route for administrators
│   │   │   ├── CampaignCard.jsx          # Campaign card with progress bar & CTA
│   │   │   ├── DonationModal.jsx         # Interactive demo donation modal
│   │   │   ├── DonationReceiptModal.jsx  # Printable receipt with Transaction ID
│   │   │   ├── Footer.jsx                # Responsive modern footer
│   │   │   ├── LoadingSkeleton.jsx       # Card & details loading skeletons
│   │   │   ├── Navbar.jsx                # Navigation bar with user dropdown
│   │   │   ├── ProgressBar.jsx           # Animated percentage progress bar
│   │   │   └── ProtectedRoute.jsx        # Route guard for authenticated users
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # Authentication state & JWT handling
│   │   │   └── ToastContext.jsx          # Custom toast notification provider
│   │   ├── pages/                        # View pages
│   │   │   ├── AdminDashboard.jsx        # Admin moderation & KPI analytics
│   │   │   ├── CampaignDetails.jsx       # Detailed campaign story & donation
│   │   │   ├── CreateCampaign.jsx        # Campaign creation with live preview
│   │   │   ├── EditCampaign.jsx          # Campaign modification
│   │   │   ├── ExploreCampaigns.jsx      # Search, filter, and sort campaigns
│   │   │   ├── Home.jsx                  # Hero, categories, impact stats, testimonials
│   │   │   ├── Login.jsx                 # User/Admin login with 1-click demo fill
│   │   │   ├── NotFound.jsx              # 404 error page
│   │   │   ├── Register.jsx              # User registration with role option
│   │   │   └── UserDashboard.jsx         # Organizer & donor personal portal
│   │   ├── services/
│   │   │   └── api.js                    # Axios instance with auth interceptor
│   │   ├── App.jsx                       # Routes & provider tree
│   │   ├── index.css                     # Tailwind CSS directives & scrollbar
│   │   └── main.jsx                      # React DOM entrypoint
│   ├── index.html                        # HTML template with Google Fonts
│   ├── package.json                      # Client dependencies
│   ├── postcss.config.js                 # PostCSS config
│   ├── tailwind.config.js                # Custom forest green & cream theme
│   ├── vite.config.js                    # Vite configuration with API proxy
│   └── .env.example                      # Client environment sample
│
├── server/                               # Backend Express.js REST API
│   ├── config/
│   │   └── db.js                         # Mongoose MongoDB connection
│   ├── controllers/
│   │   ├── authController.js             # Register, login, and verify session
│   │   ├── campaignController.js         # CRUD, search, filter, updates
│   │   ├── dashboardController.js        # User & admin aggregated stats
│   │   └── donationController.js         # Process demo donation, atomics
│   ├── middleware/
│   │   └── auth.js                       # JWT verification & role validation
│   ├── models/
│   │   ├── Campaign.js                   # Campaign Mongoose schema & virtuals
│   │   ├── Donation.js                   # Donation records & transaction IDs
│   │   └── User.js                       # User accounts & role definition
│   ├── routes/
│   │   ├── authRoutes.js                 # /api/auth endpoints
│   │   ├── campaignRoutes.js             # /api/campaigns endpoints
│   │   ├── dashboardRoutes.js            # /api/dashboard endpoints
│   │   └── donationRoutes.js             # /api/donations endpoints
│   ├── package.json                      # Server dependencies
│   ├── seed.js                           # Database seeder with sample data
│   ├── server.js                         # Express entrypoint & middleware
│   └── .env.example                      # Server environment sample
│
├── .gitignore                            # Git ignore configuration
├── package.json                          # Root monorepo script runner
├── README.md                             # Complete project documentation
├── run-backend.bat                       # 1-click backend launcher for Windows
├── run-frontend.bat                      # 1-click frontend launcher for Windows
├── seed-database.bat                     # 1-click database seeder for Windows
└── start-all.bat                         # 1-click launcher for both terminals
```

---

## ⚡ Prerequisites

Make sure the following tools are installed on your Windows machine:
1. **Node.js** (v18 or higher recommended; v24 tested) -> `node -v`
2. **npm** (v9 or higher) -> `npm -v`
3. **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or MongoDB Atlas cloud connection URI).

---

## ⚙️ Environment Variables

### Backend Configuration (`server/.env`)
Create a file named `.env` in the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/fundraiser_db
JWT_SECRET=super_secret_fundraiser_jwt_key_2026_secure!
CLIENT_URL=http://localhost:5173
```

### Frontend Configuration (`client/.env`)
Create a file named `.env` in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 How to Run the Application

You can launch the application either using the provided **1-Click Windows Batch Scripts** or via **PowerShell / Command Prompt terminals**.

### Option A: 1-Click Launchers (Easiest)
From the project folder (`fundraiser-platform`):
1. Double-click `seed-database.bat` to seed MongoDB with initial demo data.
2. Double-click `start-all.bat` to launch both backend and frontend servers in separate terminal windows automatically!

---

### Option B: Running in Separate Terminals (Manual)

#### Terminal 1: Backend Server
```powershell
cd C:\Users\Sravya\Desktop\fundraiser-platform\server
npm install
npm run seed     # Seeds demo campaigns, users, and donations
npm run dev      # Starts Express server on http://localhost:5000
```

#### Terminal 2: Frontend Client
```powershell
cd C:\Users\Sravya\Desktop\fundraiser-platform\client
npm install
npm run dev      # Starts Vite React dev server on http://localhost:5173
```

Now open your web browser and navigate to:
👉 **`http://localhost:5173`**

---

## 🔑 Demo Login Accounts

Pre-seeded accounts are provided for viva demonstrations:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@fundraiser.org` | `admin123` | Full moderation, status override, all-user overview, donation audit trail |
| **Campaign Organizer** | `sarah.organizer@fundraiser.org` | `user123` | Create campaigns, edit own campaigns, post milestones, delete |
| **Regular Donor** | `alex.donor@fundraiser.org` | `user123` | Make donations, view donation history & print receipts |

> **Viva Tip:** On the Login page (`/login`), click any of the **"1-Click Fill"** buttons to auto-populate credentials instantly!

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, optional `role`).
- `POST /api/auth/login` — Sign in and receive a signed JWT token.
- `GET /api/auth/me` — Retrieve current authenticated profile (Protected).

### Campaigns (`/api/campaigns`)
- `GET /api/campaigns` — Fetch all campaigns (supports `?search=`, `?category=`, `?status=`, `?sort=`, `?page=`, `?limit=`).
- `GET /api/campaigns/:id` — Retrieve single campaign details with organizer and 10 recent donations.
- `POST /api/campaigns` — Create a new campaign (Protected).
- `PUT /api/campaigns/:id` — Update campaign details (Protected - Organizer or Admin only).
- `DELETE /api/campaigns/:id` — Remove a campaign and its donation records (Protected - Organizer or Admin only).
- `POST /api/campaigns/:id/updates` — Post a new milestone update to the campaign timeline (Protected).

### Donations (`/api/donations`)
- `POST /api/donations` — Process a new simulated donation, atomically update campaign `raisedAmount` and `donorCount`, generate `DEMO-TXN-...` ID.
- `GET /api/donations/campaign/:campaignId` — Retrieve all public donations for a campaign.
- `GET /api/donations/my` — Retrieve authenticated user's donation history (Protected).

### Dashboards (`/api/dashboard`)
- `GET /api/dashboard/user` — Personal user metrics, user's campaigns, and donation history (Protected).
- `GET /api/dashboard/admin` — Platform metrics, all campaigns, all user accounts, transaction audit log (Admin only).
- `PATCH /api/dashboard/admin/campaigns/:id/status` — Approve, reject, or mark campaigns completed (Admin only).

---

## 💡 How Frontend, Backend, and Database Interact

1. **User Action**: A user fills out the donation form on `CampaignDetails.jsx` and clicks "Confirm Contribution".
2. **Axios Client**: The client sends a `POST /api/donations` HTTP request containing the payload. If logged in, an Axios interceptor attaches `Authorization: Bearer <JWT>`.
3. **Express Middleware**: Express receives the request, parses the JSON body, verifies the optional JWT token, and passes control to `donationController.createDonation`.
4. **Mongoose & MongoDB**:
   - Generates a unique transaction identifier.
   - Saves a new document in the `donations` collection.
   - Performs an atomic `$inc` on the `campaigns` document to increment `raisedAmount` and `donorCount` simultaneously.
5. **State Sync**: The API responds with HTTP 201 and the updated campaign figures. The React UI instantly updates the progress bar, adds the supporter to the live list, and opens the printable receipt modal without needing a full-page reload!

---

## 🎓 College Viva Presentation Checklist

- [x] **Full-Stack Execution**: Both frontend and backend run seamlessly with connected MongoDB.
- [x] **Data Persistence**: Refreshing the browser preserves all created campaigns and donations in MongoDB.
- [x] **JWT Security**: Storing tokens in localStorage with Bearer headers in Axios.
- [x] **Search & Filters**: Real-time keyword search, category pills, and sorting dropdown.
- [x] **Role-Based Access Control**: Normal users cannot access `/admin` or invoke admin endpoints.
- [x] **Demo Payment Clarity**: Clearly explains the simulated payment sandbox without misleading users.
- [x] **Printable Receipts**: Direct `window.print()` trigger for tangible demonstration.
