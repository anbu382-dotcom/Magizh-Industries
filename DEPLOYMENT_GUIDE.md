# Firebase Deployment Guide - Magizh Industries

## Prerequisites Completed ✓
- Firebase Blaze plan active
- Custom domain purchased from Spaceship
- Project structure configured for Firebase

## DEPLOYMENT STEPS

### STEP 1: Update All API URLs (IMPORTANT!)

You need to update all frontend files to use `API_BASE_URL` instead of hardcoded localhost URLs.

**Files requiring updates:**
- ✓ frontend/src/pages/Login.jsx (DONE)
- frontend/src/components/UserManagement.jsx
- frontend/src/pages/Stock/ArchivedMaster.jsx
- frontend/src/pages/Stock/DeleteMaster.jsx
- frontend/src/pages/Stock/LogTable.jsx
- frontend/src/pages/Stock/EntryStock.jsx
- frontend/src/pages/Stock/CreateMaster.jsx
- frontend/src/pages/Stock/FinalData.jsx
- frontend/src/pages/Stock/ChangeMaster.jsx
- frontend/src/pages/Stock/Master.jsx (if exists)
- frontend/src/pages/Stock/Dispatch.jsx (if exists)
- frontend/src/pages/Stock/Entry.jsx (if exists)
- frontend/src/pages/Stock/Report.jsx (if exists)

**For each file:**
1. Add import at top:
   ```javascript
   import { API_BASE_URL } from '../config/api';  // adjust path as needed
   ```

2. Replace ALL instances of:
   ```javascript
   'http://localhost:5000/api/...'
   ```
   with:
   ```javascript
   `${API_BASE_URL}/api/...`
   ```

---

### STEP 2: Set Up Firebase Environment Variables

Run these commands to configure your secrets:

```powershell
cd "d:\OneDrive\Desktop\Magizh"

# Set JWT secret
firebase functions:secrets:set JWT_SECRET

# Set email credentials
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASS

# Set admin email
firebase functions:secrets:set ADMIN_EMAIL
```

When prompted, enter the values from your backend/.env file.

---

### STEP 3: Install Functions Dependencies

```powershell
cd functions
npm install
cd ..
```

---

### STEP 4: Build Frontend

```powershell
cd frontend
npm install
npm run build
cd ..
```

This creates the `frontend/dist` folder with production-ready files.

---

### STEP 5: Deploy to Firebase

```powershell
# Deploy everything (Functions + Hosting)
firebase deploy

# OR deploy separately:
firebase deploy --only functions
firebase deploy --only hosting
```

After deployment, Firebase will give you URLs like:
- Hosting: `https://your-project.web.app`
- Functions: `https://us-central1-your-project.cloudfunctions.net/api`

---

### STEP 6: Connect Custom Domain (Spaceship)

#### A. In Firebase Console:
1. Go to https://console.firebase.google.com
2. Select your project
3. Go to **Hosting** → **Add custom domain**
4. Enter your domain (e.g., `magizh.com`)
5. Firebase will show DNS records you need to add

#### B. In Spaceship (your domain registrar):
1. Login to https://www.spaceship.com
2. Go to **My Domains** → Select your domain
3. Go to **DNS Settings** or **DNS Management**
4. Add the DNS records Firebase provided:

**Type A Record:**
- Type: `A`
- Name: `@`
- Value: (IP addresses from Firebase, usually 2)
- TTL: `3600`

**Type A Record for www:**
- Type: `A`
- Name: `www`
- Value: (same IPs from Firebase)
- TTL: `3600`

5. Save DNS changes

**Note:** DNS propagation can take 24-48 hours, but often works within 1-2 hours.

---

### STEP 7: Verify SSL Certificate

1. After DNS propagates, Firebase automatically provisions SSL
2. Check status in Firebase Console → Hosting → Custom domains
3. Wait for status to show "Connected" with green checkmark
4. SSL certificate will auto-renew

---

### STEP 8: Test Deployment

```powershell
# Test your deployed site
start https://your-domain.com

# Test API endpoint
Invoke-WebRequest -Uri https://your-domain.com/api/health
```

---

## Important Notes

### Firebase Service Account
- Upload your `serviceAccountKey.json` to Firebase Console
- Or use Firebase Admin SDK initialization without file (recommended)
- Update `backend/config/firebase.js` to use environment variable

### Environment Variables Access
In your Cloud Functions, access secrets like:
```javascript
const { defineSecret } = require('firebase-functions/params');
const jwtSecret = defineSecret('JWT_SECRET');

// Use in function:
exports.api = functions.https.onRequest({ secrets: [jwtSecret] }, (req, res) => {
  const secret = jwtSecret.value();
  // ...
});
```

### Cost Monitoring
- Functions: Free tier 2M invocations/month
- Hosting: Free tier 10GB storage, 360MB/day transfer
- Monitor usage in Firebase Console → Usage & billing

### CI/CD (Optional)
Set up GitHub Actions for automatic deployment:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd frontend && npm ci && npm run build
      - run: cd functions && npm ci
      - uses: w9jds/firebase-action@master
        with:
          args: deploy
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## Troubleshooting

### Functions not working?
```powershell
firebase functions:log
```

### Check deployment status:
```powershell
firebase hosting:channel:list
```

### Test functions locally:
```powershell
firebase emulators:start
```

### Clear cache and redeploy:
```powershell
Remove-Item -Recurse -Force frontend/dist
Remove-Item -Recurse -Force functions/node_modules
cd frontend; npm run build
cd ../functions; npm install
cd ..
firebase deploy
```

---

## Next Steps After Deployment

1. ✓ Test all features (login, registration, stock management)
2. ✓ Monitor Firebase Console for errors
3. ✓ Set up Firebase Analytics (optional)
4. ✓ Configure Firebase Security Rules
5. ✓ Set up custom email templates
6. ✓ Add monitoring/alerting
