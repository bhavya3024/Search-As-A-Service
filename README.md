# Search As a Service

A microservices-based application that handles user based  API crawling functionalities.

## Services

### User Service
Handles user authentication and management with features including:
- User registration with OTP verification
- Login with JWT authentication
- Password reset functionality
- User profile management
- Email notifications using Resend API

### Crawler Service
Manages web crawling operations with:
- Multiple crawler configurations
- API integrations (GitHub, Stack Exchange, News API)
- Elasticsearch integration for data storage and search
- Secure credential management

## Technical Stack

- Node.js
- Express.js
- MongoDB
- Elasticsearch
- JWT Authentication
- Resend Email Service

## Environment Setup

### User Service
```properties
MONGODB_URI=mongodb://127.0.0.1:27017/users
JWT_SECRET=your_jwt_secret_key
RESEND_API_KEY=your_resend_api_key
RESEND_EMAIL=your_sender_email

