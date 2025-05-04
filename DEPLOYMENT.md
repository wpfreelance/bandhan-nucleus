# Bandhan Student Verification Portal - Deployment Guide

This guide will help you deploy the Bandhan Student Verification Portal to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [Neon.tech](https://neon.tech) account (for PostgreSQL database)
3. A [Firebase](https://firebase.google.com) project (for OTP authentication)
4. [SendGrid](https://sendgrid.com) account (optional, for email notifications)

## Step 1: Setup the PostgreSQL Database

1. Create a PostgreSQL database on Neon.tech or any other PostgreSQL provider
2. Note down your database connection string, it should look something like:
   ```
   postgres://user:password@host:port/database
   ```

## Step 2: Setup Firebase for OTP Authentication

1. Go to the [Firebase console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Enable Phone Authentication in the Authentication section
5. Add your production domain to the authorized domains list
6. Note down the following Firebase configuration details:
   - apiKey
   - projectId
   - appId

## Step 3: Deploy to Vercel

1. Create a new project in Vercel
2. Connect your GitHub, GitLab, or Bitbucket repository, or use the Vercel CLI to deploy
3. Set the following environment variables in the Vercel dashboard:

   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | Your PostgreSQL connection string |
   | `VITE_FIREBASE_API_KEY` | Firebase API Key |
   | `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
   | `VITE_FIREBASE_APP_ID` | Firebase App ID |
   | `SENDGRID_API_KEY` | (Optional) SendGrid API Key for email notifications |
   | `RAZORPAY_KEY_ID` | Razorpay Key ID for payment integration |
   | `RAZORPAY_KEY_SECRET` | Razorpay Key Secret for payment integration |

4. In the build settings, use the following:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Development Command: `npm run dev`

5. Deploy the application by clicking "Deploy"

## Step 4: Database Schema Migration

The database schema will be automatically created during the first deployment if you have set the `DATABASE_URL` environment variable correctly. If you need to manually run the migration, you can do so with:

```bash
npm run db:push
```

## Step 5: Post-Deployment Configuration

1. Set up your custom domain in Vercel dashboard
2. Update the authorized domains in Firebase to include your Vercel deployment URL
3. Test the OTP authentication to ensure it's working correctly

## Vercel Deployment Options

Vercel offers several deployment options that might be useful for this project:

1. **Serverless Functions**: All API routes are automatically deployed as serverless functions.
2. **Edge Functions**: For improved global performance.
3. **Preview Deployments**: Each pull request creates a preview deployment.
4. **Environment Variables per Branch**: Set different environment variables for development, staging, and production.

## Monitoring and Logs

After deployment, you can monitor your application's performance and check logs in the Vercel dashboard. This is useful for troubleshooting any issues that might arise.

## Troubleshooting Common Issues

1. **Database Connection Issues**: Ensure your DATABASE_URL is correctly formatted and that the database is accessible from Vercel's servers.
2. **Firebase Authentication Problems**: Double-check that you've added your Vercel deployment URL to the authorized domains in Firebase.
3. **Build Failures**: Check the Vercel build logs for any errors in your code.

## Security Considerations

1. Never commit sensitive environment variables to your repository
2. Use environment variables for all sensitive information
3. Set up appropriate CORS headers for API routes
4. Consider implementing rate limiting for authentication endpoints

## Support

If you encounter any issues with deployment, please contact the development team for support.