# CFWM Backend API

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

Comprehensive MVC-based backend API for Christ For The World Mission (CFWM). This server manages church events, testimonies, bookstore inventory, sermons, locations, and various administrative forms.

## 🚀 Features

- **Robust MVC Architecture**: Separated concerns for scalability and maintainability.
- **Advanced Security**:
  - **Helmet**: Secure HTTP headers.
  - **CORS Hardening**: Strict origin validation.
  - **Rate Limiting**: Protection against Brute-force and DDoS attacks.
  - **JWT Authentication**: Secure admin access.
- **Media Management**: Integrated with **Cloudinary** for image/file uploads via **Multer**.
- **Data Integrity**: Input validation using **Joi**.
- **Scalability**: UUID-based primary keys for all database records.
- **Logging**: Sophisticated logging system using **Winston**.

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MySQL (with Connection Pooling)
- **Security**: Bcrypt.js, JSON Web Tokens (JWT), Helmet, Express Rate Limit
- **Utilities**: Winston (Logging), Joi (Validation), Multer & Cloudinary (File Management), Dotenv

## 📂 Project Structure

```bash
cfwm-backend/
├── config/             # Configuration files (Database, Cloudinary)
├── controllers/        # Business logic & Request handling
├── middleware/         # Auth & Error handling middleware
├── models/             # Database access layer
├── routes/             # API endpoint definitions
├── scripts/            # Utility scripts (seeders, etc.)
├── services/           # External service integrations
├── logs/               # Application log files
├── schema.sql          # Database schema dump
├── README.md           # Project documentation
└── index.js            # Main entry point
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL Server

### 1. Clone & Install

```bash
git clone <repository-url>
cd cfwm-backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cfwm_db

# Security
JWT_SECRET=your_secret_key

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Database Setup

Import the `schema.sql` file into your MySQL database.

```bash
mysql -u root -p cfwm_db < schema.sql
```

### 4. Run the Application

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

---

## 📊 Database Schema

| Table             | Description                                                        |
| :---------------- | :----------------------------------------------------------------- |
| `events`          | Church events, themes, dates, and locations.                       |
| `testimonies`     | Member testimonies with moderation status (`pending`, `approved`). |
| `products`        | Bookstore items (physical/digital), pricing, and stock.            |
| `sermons`         | Audio/Video sermons with speaker details and series.               |
| `districts`       | Administrative districts.                                          |
| `branches`        | Local church branches linked to districts.                         |
| `first_timers`    | Visitor records for follow-up.                                     |
| `prayer_requests` | Confidential/Public prayer points.                                 |
| `subscribers`     | Newsletter email subscriptions.                                    |

---

## 🛣️ API Endpoints

### 🔐 Authentication

- `POST /api/auth/login` - Administrator login (returns JWT).

### 📅 Events

- `GET /api/events` - Get all published events.
- `GET /api/events/:id` - Get event details.
- `POST /api/events` - Create new event (Admin).
- `PUT /api/events/:id` - Update event (Admin).
- `DELETE /api/events/:id` - Remove event (Admin).

### 📖 Sermons

- `GET /api/sermons` - List all sermons (supports `?type=video` filter).
- `POST /api/sermons` - Upload/Register new sermon (Admin).

### 🛍️ Store

- `GET /api/products` - List products (supports `?category=book` filter).
- `POST /api/products` - Add product with image upload (Admin).

### 💬 Testimonies

- `GET /api/testimonies` - List approved testimonies.
- `POST /api/testimonies` - Submit a new testimony (Public).
- `PUT /api/testimonies/:id` - Approve or reject testimony (Admin).

### 📍 Locations

- `GET /api/locations/districts` - Get all districts and branches.
- `GET /api/locations/headquarters` - Get HQ details.

### 📝 Forms

- `POST /api/forms/first-timer` - Submit visitor details.
- `POST /api/forms/prayer-request` - Submit prayer request.
- `GET /api/forms/first-timers` - List submissions (Admin).

### 📧 Newsletter

- `POST /api/newsletter/subscribe` - Email subscription.
- `GET /api/newsletter/subscribers` - List all subscribers (Admin).

### 📈 Statistics

- `GET /api/stats/overview` - Dashboard statistics summary (Admin).

### 🏥 Health Check

- `GET /api/health` - Monitor server and database status.

---

## 🛡️ Security Features

1. **Helmet**: Protects from well-known web vulnerabilities by setting HTTP headers appropriately.
2. **Rate Limiting**:
   - General API: 100 requests every 15 minutes.
   - Login: 10 attempts every 15 minutes.
3. **CORS**: Strict Origin validation against `CLIENT_URL`.
4. **JWT**: Stateless session management for administrative routes.

## 📄 License

This project is licensed under the ISC License.
