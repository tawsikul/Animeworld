/* ==========================================================
   OPTIONAL — SYNCED ACCOUNTS
   ----------------------------------------------------------
   You do NOT need to touch this file. Leave it exactly as it is
   and the site works: accounts and saved lists are stored in the
   browser on each device.

   Fill it in only if you want one account to work across phone,
   laptop and tablet. The site detects real keys automatically and
   switches over — no other code changes.

   1. console.firebase.google.com → Add project
   2. Build → Authentication → Get started → enable Email/Password
   3. Build → Firestore Database → Create database → test mode
   4. Project settings → Your apps → Web (</>) → Register app
   5. Copy the six values it shows you into the object below
   6. Re-upload this file

   Note: these values are safe to expose publicly. Firebase security
   comes from your Firestore rules, not from hiding the keys. Before
   going live, lock Firestore down so each person only reaches their
   own documents:

     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{uid}/{document=**} {
           allow read, write: if request.auth != null && request.auth.uid == uid;
         }
       }
     }
   ========================================================== */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
