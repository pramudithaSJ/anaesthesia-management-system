# Anaesthesia Management System

A comprehensive management system for anaesthesiologists across Sri Lankan hospitals, built with Next.js, Firebase, and TypeScript.

## Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled

## Environment Setup

1. Copy the environment variables template:
```bash
cp .env.example .env.local
```

2. Get your Firebase configuration from the [Firebase Console](https://console.firebase.google.com/):
   - Go to your project settings
   - Copy the config values from "Your Apps" section
   - Update `.env.local` with your actual values

3. Required environment variables:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Getting Started

First, install dependencies:
```bash
npm install
```

Then run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Build and Deploy

### Building for Production

```bash
npm run build
```

### Deploy on Vercel

1. **Environment Variables**: In your Vercel project settings, add all the environment variables from your `.env.local` file:
   - Go to Project Settings → Environment Variables
   - Add each `NEXT_PUBLIC_FIREBASE_*` variable with your actual values

2. **Deploy**: The easiest way to deploy is to use the [Vercel Platform](https://vercel.com/new):
   - Connect your GitHub repository
   - Ensure environment variables are set
   - Deploy automatically on push to main branch

3. **Troubleshooting**: If you encounter build errors:
   - Verify all environment variables are set in Vercel
   - Check build logs for missing Firebase configuration
   - Ensure your Firebase project allows requests from your domain

### Other Deployment Options

This app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Digital Ocean App Platform
- Railway

Make sure to set the environment variables in your deployment platform.
