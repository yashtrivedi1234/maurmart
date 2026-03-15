# Maurya Mart - Your Daily Essentials

Maurya Mart is a modern E-commerce platform designed to provide a seamless shopping experience for daily essentials, electronics, and fashion.

## 🚀 Features

- **Store Front**: Browse products by categories, featured items, and trending deals.
- **User Authentication**: Secure login/signup with OTP verification.
- **Admin Panel**: Effortlessly manage products, hero slides, and view orders.
- **Secure Payments**: Integrated with Razorpay for a smooth checkout experience.
- **Real-time Notifications**: Automated email receipts for customers and order alerts for the owner.
- **Cloud Image Storage**: Powered by Cloudinary for high-performance image delivery.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Redux Toolkit Query
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Image Storage**: Cloudinary
- **Payments**: Razorpay
- **Email**: Nodemailer (Gmail SMTP)

## 📦 Installation & Setup

### Prerequisites
- Node.js & npm
- MongoDB Atlas account
- Cloudinary account
- Razorpay account

### Backend Setup
1. Navigate to `Bankend` directory.
2. Install dependencies: `npm install`.
3. Create a `.env` file with the following:
   ```env
   MONGO_URI=your_mongodb_uri
   PORT=5001
   JWT_SECRET=your_jwt_secret
   ADMIN_EMAIL=admin@gmail.com
   EMAIL_USER=your_email
   EMAIL_PASS=your_app_password
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Start server: `npm start`.

### Frontend Setup
1. Navigate to `Frontend` directory.
2. Install dependencies: `npm install`.
3. Start development server: `npm run dev`.

## 📄 License
This project is private and intended for Maurya Mart operations.
