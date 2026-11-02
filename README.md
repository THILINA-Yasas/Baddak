# Baddk Store

Static storefront and Firebase-backed product admin for the Baddak Store.

## Local preview

Serve this folder with any static web server, then open `index.html`. The storefront uses the Firebase project selected in `.firebaserc`.

## GitHub deployment

Pushing to `main` runs the Firebase Hosting deployment workflow for `baddak-store-2026`.

Before the first deployment, add a GitHub Actions repository secret named `FIREBASE_SERVICE_ACCOUNT_BADDK_STORE_2026`. Its value must be the JSON key for a Google Cloud service account with permission to deploy Firebase Hosting to this project. Create the key in Google Cloud Console → IAM & Admin → Service Accounts, then add it under the GitHub repository’s Settings → Secrets and variables → Actions. Do not commit the service-account JSON key.

The Firebase web app configuration in `firebase-config.js` is client-side configuration, not a service-account credential. Continue to rely on Firebase Authentication and Firestore Security Rules to protect data and writes.
