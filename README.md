# 🛒 Bulka Bazar Server

This is the backend server for the **Bulka Bazar** B2B wholesale product platform, built using **Express.js**, **MongoDB**, and **Firebase Admin SDK** for authentication. It supports features like product management, secure authentication, purchases, popular categories, and more.

---

## 🚀 Technologies Used

- Node.js
- Express.js
- MongoDB (with native driver)
- Firebase Admin SDK (for verifying JWT)
- Dotenv (`.env` file for secrets)
- Cookie Parser & CORS

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/rifat-hasan121/Bulka-Bazar-Server.git
cd Bulka-Bazar-Server
npm install

# Server Configuration
PORT=3000

# MongoDB Credentials
DB_NAME=B2B_wholesale_platform
DB_PASSWORD=IqC4i4SIGYqCzq8r

FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=assignment-11-f22d8
FIREBASE_PRIVATE_KEY_ID=4101c5cfbad430156479f12ab822992005e5cc49
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDuoCy0gy+mkPF1\nrMFvV1J54Ccr2H21FfUhpdSIvUwmGLsZCZeqZ/aqtRl3Rfh+LxhKk/fYMygmkXR+\ndgLsSw6p9qkyg7Hl5o7qLbodDuGdG7r9EIzf3YfN79LVAZLzLj70UM7OIWhuXTmt\nGOVWlVS74e4GGFD6Ap3QUBrQSO0EQT8IDBWJlHNfFkhbzTjRDghrvmLcq+8QAXzl\npxXL9bdmZ49QhKUCMjF49lKavI1vVQXvjx2Y/6JKubtBIYE02BFszGZwlWOdJJ2N\nGzkd6Q0tSBZ1Ccp0+4uxnYtaKQAqUXzSfq2cHMaEHdz5xsHuhKbtYpFm5mG+MKKz\nj1ZGLW6hAgMBAAECggEAAWbdfF387KyTTo6qQD4yFNc1Q7Os4WB0pTL1MaxzAxJI\nHxiIVI7xywTvVl0J3avnJ6EA5rs+NCPMnGWTFNJIDsWNLufJJsGY+1Uzb7JDrwmX\nqp7rRPFnN9V91pSAyX7vDb5fyKQ3mdZgXVz1E/Iiokvsewqvhxh21t9xmOGkys6Y\nab7PJ75fXohX83Fy4212nyr7ksnieR2BfqrnoVMQUUYMaTXTHCWXc91LzkN9BLW7\nmKViVFeexAAFLAbKvC2FjA2YXmqQQpdnHWjZMkmsYGPLhXpwQstHEPmjAd3UbU+B\nRVQaB1/dotOuGWe5RyFu6AsrPsHpXvb/3KizA6dslQKBgQD5xX3TKMAdVxDqT7Bg\nQI/PxKr8LAOwR9V40avcj2SHNFdoFNBhOQUq8MFUNRvnS30ON0V8KsZ5TFbSO0qX\nsGUq9ZUbvBWktHBOEXUHqOwxFqnEQEq1KXaeyiXd6fWawxDi7sqdemXkckRWJRgU\nTBwHueymvY1W4s5FWlXqW4UR8wKBgQD0k4etEK+whoyxTlcjyMdU0zl5ddad3iD4\nqKk9EuE381DclqTCJHht9WxnFaPJP++zpQR+XvaYSlTVCy7XlZEBWIjMXBuORAZK\n9Abe6hpXDzCqde/L/1vK0w1MsCSShoyunPj6iYOtFEycDVHMUXqM7kHcFPaL78A8\nVDJTFEHOGwKBgHQB9THpIGnAMZwSjSH3epQOjTf4nXH3uz+VatRTSWa+ucYevLYb\nTLon/jNFQ4OG/TtoEn7cQzi9aynT3g5cIHD2hV3PWuIX6H1qAEghfipCk3ESR2Cj\nNHQGAdZzPt61sRclv7eqzL5xECpOqkNrIi24fiDns0jiqNlvXq4t+b1fAoGAPf9r\n5DYXozLoVUXblwmdZeZJan2xksEtMHtosz+m8czvEYvqZgBiutT8zsDQjQJ1G9/X\n3MTr07z79ilojWOvp1yvCMbMgWrDAZsMZtOHK8yA9KUCzX6E4UxQ0cDQ9IfA/75w\n6umTBHvh06kYtCdvXmxDK6vwt5Zl76UUQLUg3UMCgYBAbyL7WGtVxyZMnkv4OFSq\nFFYGS01xAuw08UuqLP4NjkmGjkbJ5JIKQh6ZFTKcXI8cgPWXR1/w/Y1qPJ+GSmRN\nqe4cPHVVHE22GMO4ZhS45lxwIBZ12qNxWl2eixaqoNevVQCnCQgmDQpUUOZurKUo\npcXjyHU6/u0bLDNMO+N3xg==\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@assignment-11-f22d8.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=116837628521678150568
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40assignment-11-f22d8.iam.gserviceaccount.com
FIREBASE_UNIVERSE_DOMAIN=googleapis.com



✅ Available API Endpoints

Method	Endpoint	Description
GET	/all-products	Get all products (JWT protected)
GET	/products	Get products by category
GET	/products/available	Get products with quantity > 100
GET	/products/:id	Get a single product by ID
GET	/top-rated-products	Get top 20 rated products
GET	/my-purchases?email=...	Get purchase history (JWT protected)
GET	/my-product?email=...	Get your added products (JWT protected)
GET	/popular-categories	Get top 6 product categories
POST	/purchase	Purchase a product
POST	/add-products	Add new product (JWT protected)
PUT	/products/:id	Update product (JWT protected)
DELETE	/cancel-purchase/:id	Cancel a purchase and restore quantity

🔐 JWT Authentication (Firebase)
Pass the Firebase ID token in the Authorization header as:

Authorization: Bearer <token>



🧪 Run the Server
npm run start

📂 Folder Structure

📦 root/
 ┣ 📄 index.js
 ┣ 📄 .env
 ┣ 📄 .gitignore
 ┣ 📄 package.json

🛡️ Security Note
.env
firebase-adminsdk-*.json


👨‍💻 Author
Developed by MD Rifat Hasan


