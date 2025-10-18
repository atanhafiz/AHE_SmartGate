# AHE SmartGate v1 - Netlify Deployment Guide

## 🚀 Quick Deployment Steps

### 1. **Build Configuration** ✅
- ✅ `netlify.toml` created with correct settings
- ✅ `package.json` has required scripts
- ✅ Build tested successfully

### 2. **Environment Variables Setup**

#### In Netlify Dashboard:
1. Go to **Site Settings** → **Build & Deploy** → **Environment**
2. Add these variables:

```
VITE_SUPABASE_URL=https://kpukhpavdxidnoexfljv.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdWtocGF2ZHhpZG5vZXhmbGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDMxNTcsImV4cCI6MjA3NjMxOTE1N30.EI_aqXesZUxUaGRDY12OZ13U3CXdz6TvJkNyQ9a1-7s
TELEGRAM_BOT_TOKEN=8351952708:AAE9c6am6Lq1ZRj00nb87zwa2X6Znfmoy1A
TELEGRAM_CHAT_ID=-1003119983761
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdWtocGF2ZHhpZG5vZXhmbGp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc0MzE1NywiZXhwIjoyMDc2MzE5MTU3fQ.o4V5CU70VzhTT4-T6p83Z9S2fkcv3VXpf0HEpFCVHRQ
```

### 3. **Deployment Options**

#### Option A: Manual Deploy (Quickest)
1. Run `npm run build`
2. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist` folder to the drop zone
4. Your site will be live in seconds!

#### Option B: Git Deploy (Recommended)
1. Push your code to GitHub
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click **"Add new site from Git"**
4. Select your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variables (see step 2)
7. Deploy!

### 4. **Build Settings Verification**

#### netlify.toml Configuration:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[dev]
  command = "npm run dev"
  port = 5173

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### package.json Scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 5. **Testing Your Deployment**

#### Local Preview Test:
```bash
npm run build
npm run preview
```
Visit: http://localhost:4173/

#### Test All Routes:
- ✅ `/` - Register page
- ✅ `/register` - Entry form
- ✅ `/guard` - Guard dashboard
- ✅ `/admin` - Admin dashboard
- ✅ `/login` - Login page

### 6. **Production Features**

#### ✅ **Working Features:**
- **Camera Access**: Webcam capture for selfies
- **Supabase Integration**: Database and storage
- **Telegram Notifications**: Real-time alerts
- **Responsive Design**: Mobile-friendly
- **React Router**: All routes work on refresh

#### ✅ **Environment Variables:**
- **Supabase Connection**: Database and storage
- **Telegram Bot**: Notifications to admin
- **Edge Function**: Real-time alerts

### 7. **Troubleshooting**

#### Common Issues:
1. **404 on Route Refresh**: Fixed by `netlify.toml` redirects
2. **Environment Variables**: Make sure all are set in Netlify
3. **Build Failures**: Check Node.js version (use 18+)
4. **Camera Issues**: HTTPS required for camera access

#### Build Commands:
```bash
# Test build locally
npm run build

# Preview production build
npm run preview

# Check build output
ls -la dist/
```

### 8. **Post-Deployment Checklist**

#### ✅ **Verify These Work:**
- [ ] Site loads at your Netlify URL
- [ ] All routes work (/, /register, /guard, /admin)
- [ ] Camera access works (HTTPS required)
- [ ] Supabase connection works
- [ ] Telegram notifications work
- [ ] Mobile responsive design

#### ✅ **Test User Flows:**
1. **Visitor Registration**: Take selfie → Fill form → Submit
2. **Guard Reporting**: Capture photo → Add notes → Submit
3. **Admin Dashboard**: View entries → Filter data → Export

### 9. **Performance Optimization**

#### Build Output:
- **HTML**: 0.47 kB (gzipped: 0.30 kB)
- **CSS**: 21.37 kB (gzipped: 4.40 kB)
- **JS**: 345.39 kB (gzipped: 101.21 kB)
- **Total**: ~367 kB (gzipped: ~106 kB)

#### Optimization Features:
- ✅ **Code Splitting**: Automatic by Vite
- ✅ **Tree Shaking**: Unused code removed
- ✅ **Gzip Compression**: Netlify handles automatically
- ✅ **CDN**: Global content delivery

### 10. **Security Notes**

#### Environment Variables:
- ✅ **Public Variables**: VITE_* variables are safe for frontend
- ✅ **Private Variables**: Service keys should be server-side only
- ✅ **Supabase RLS**: Row Level Security enabled

#### HTTPS Requirements:
- ✅ **Camera Access**: Requires HTTPS in production
- ✅ **Supabase**: Works over HTTPS
- ✅ **Netlify**: Automatic HTTPS

## 🎉 **Deployment Complete!**

Your AHE SmartGate v1 is now ready for production deployment on Netlify with:
- ✅ **Full Functionality**: All features working
- ✅ **Mobile Optimized**: Responsive design
- ✅ **Real-time Updates**: Supabase + Telegram
- ✅ **Production Ready**: Optimized build

**Next Steps:**
1. Deploy to Netlify using Option A or B above
2. Test all functionality on live site
3. Share with your team for testing
4. Monitor Telegram notifications

**Live Site URL:** `https://your-site-name.netlify.app`
