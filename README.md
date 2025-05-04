# Bandhan Student Verification Portal

A comprehensive Next.js student verification and management portal designed to streamline educational institution discount processes through secure, multi-role authentication and advanced administrative tools.

## Key Features

- Student verification workflow with selfie upload
- Admin dashboard for managing students
- Excel file import for bulk student data
- Discount application for verified students
- Integration with WooCommerce for services
- Razorpay payment processing

## Technologies Used

- Next.js frontend
- Firebase authentication (OTP-enabled)
- PostgreSQL database with Drizzle ORM
- WooCommerce integration
- Secure multi-role access controls
- Responsive mobile-first design
- SendGrid email integration
- Vercel deployment ready

## Project Structure

- `/components` - Reusable UI components
- `/pages` - Next.js pages and API routes
- `/public` - Static assets
- `/scripts` - Utility scripts for database setup
- `/server` - Server-side code
- `/shared` - Shared types and schema
- `/styles` - CSS and styling
- `/utils` - Utility functions

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env.local` and fill in the required values.

3. Run the development server:
   ```
   npm run dev
   ```

4. Initialize the database:
   ```
   npm run db:push
   ```

## Authentication

- Students: Phone number verification with OTP via Firebase
- Administrators: Username/password login

## Deployment

See the `DEPLOYMENT.md` file for detailed deployment instructions.

## License

This project is proprietary and confidential.