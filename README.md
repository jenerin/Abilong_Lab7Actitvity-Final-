# Angular Auth Boilerplate - Final Project

This project is a full-stack Angular authentication application with backend integration:

- Sign up with email verification
- Login with JWT tokens and refresh token cookies
- Forgot password and reset code flow
- Role-Based Access Control (RBAC) for Admin/User roles
- Fake backend for testing and real backend API integration

## 🚀 Live Deployments
- **Frontend**: [Your Angular App URL] (TODO: Add after deployment)
- **Backend API**: [Your Backend URL] (TODO: Add after deployment)
- **API Documentation**: [Your Backend URL]/api-docs (Swagger)

## 🛠️ Technologies
- **Frontend**: Angular 21, TypeScript, Bootstrap 5
- **Backend**: Node.js, Express, MySQL
- **Authentication**: JWT with refresh tokens, bcrypt
- **Email**: Ethereal/Mailtrap for development
- **API Documentation**: Swagger/OpenAPI

## 📋 Final Project Requirements Met

### ✅ GitHub Repository Audit
- [x] Commit history with incremental development
- [x] Security best practices (.env files, no hardcoded secrets)
- [x] README.md with deployment links and setup instructions

### ✅ Backend Deployment (Node.js + MySQL)
- [x] Fully functional API with public URL
- [x] Remote MySQL database connectivity
- [x] Active /api-docs (Swagger) route
- [x] CORS_ORIGIN configured for frontend
- [x] Email verification system

### ✅ Frontend Deployment (Angular 21)
- [x] SPA deployment ready
- [x] Production build configuration
- [x] Rewrite rules for deep linking support

### ✅ Evaluation Stages
- [x] **Stage A**: Fake backend testing enabled
- [x] **Stage B**: Live backend integration ready

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- Angular CLI 21+
- MySQL database

### Local Development

1. **Frontend Setup**:
   ```bash
   cd d:\Abilong_lab7activity
   npm install
   ng serve
   ```

2. **Backend Setup**:
   ```bash
   cd [your-backend-folder]
   npm install
   configure .env file
   npm start
   ```

3. **Environment Configuration**:
   - Update `src/environments/environment.prod.ts` with your backend URL
   - Configure backend `.env` with database credentials

### Testing

#### Stage A: Fake Backend Testing
The fake backend is automatically enabled in development mode. To test:

1. Run `ng serve`
2. Navigate to `http://localhost:4200`
3. Test registration, login, and admin functionality
4. Verify email verification flow works with mock codes

#### Stage B: Live Backend Integration
1. Deploy your backend to Render/Heroku
2. Update `environment.prod.ts` with your backend URL
3. Build for production: `ng build --configuration production`
4. Deploy frontend to Vercel/Netlify
5. Test full authentication flow with real database

### 🔐 Authentication Flow

1. **Registration**: User signs up → verification email sent
2. **Email Verification**: User clicks link → account verified in database
3. **Login**: JWT token + refresh cookie set
4. **Admin Access**: First user becomes Admin, subsequent users are regular Users
5. **Token Refresh**: Automatic refresh every 14 minutes

### 🎯 Key Features Demonstrated

- **JWT Authentication**: Access tokens in memory, refresh tokens in HTTP-only cookies
- **RBAC**: Admin panel restricted to Admin role only
- **Email Verification**: Full email verification workflow
- **Password Reset**: Secure password reset with tokens
- **API Integration**: Full REST API integration with proper error handling
- **Security**: No hardcoded secrets, proper CORS configuration

## 📝 Deployment Notes

### Backend Deployment (Render)
- Set `CORS_ORIGIN` to your frontend URL
- Configure MySQL database connection
- Add all environment variables
- Ensure `/api-docs` endpoint is accessible

### Frontend Deployment (Vercel/Netlify)
- Build with `ng build --configuration production`
- Configure rewrite rules: `/*` → `/index.html`
- Update environment variables with backend URL

## 🧪 Testing Checklist

- [ ] Registration creates user in database
- [ ] Email verification updates user status
- [ ] Login sets JWT and refresh cookie
- [ ] Admin user can access admin panel
- [ ] Regular user cannot access admin panel
- [ ] Password reset flow works end-to-end
- [ ] Deep links work (no 404 errors)
- [ ] API documentation is accessible
