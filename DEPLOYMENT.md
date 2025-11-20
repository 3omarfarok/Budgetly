# Deployment Guide - Budgetly على Vercel

## 📦 Backend Deployment (Server)

### 1. تجهيز المشروع
```bash
cd server
```

### 2. رفع على Vercel
```bash
vercel
```

### 3. إضافة Environment Variables في Vercel Dashboard
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=https://your-frontend-url.vercel.app
```

### 4. Deploy
```bash
vercel --prod
```

---

## 🎨 Frontend Deployment (Client)

### 1. تحديث .env
```env
VITE_API_URL=https://your-backend-url.vercel.app/api
```

### 2. Build المشروع
```bash
cd client
npm run build
```

### 3. رفع على Vercel
```bash
vercel
```

### 4. Deploy Production
```bash
vercel --prod
```

---

## ⚙️ ملاحظات مهمة

### Backend
- ✅ CORS تم ضبطه للسماح بالـ frontend URL
- ✅ `vercel.json` موجود للتوجيه
- ✅ Environment variables جاهزة

### Frontend
- ✅ `.env` file للـ API URL
- ✅ `api.js` يستخدم `VITE_API_URL`
- ✅ Build command: `npm run build`

### MongoDB Atlas
تأكد إن:
1. MongoDB Atlas IP whitelist يسمح بـ `0.0.0.0/0` (أو Vercel IPs)
2. Connection string صحيح في environment variables

---

## 🚀 Quick Commands

### Local Development
```bash
# من root directory
npm run dev
```

### Production Deployment
```bash
# Backend
cd server && vercel --prod

# Frontend
cd client && vercel --prod
```

---

## 🔗 URLs بعد الـ Deployment

Frontend: `https://budgetly-frontend.vercel.app`  
Backend: `https://budgetly-backend.vercel.app`

غير الـ URLs دي في:
- Frontend `.env` → `VITE_API_URL`
- Backend Vercel → `CLIENT_URL` environment variable
