import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { isAuthenticated } from '../utils/auth';

export default function Layout({ children, title = "Student Verification Portal | Bandhan" }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authUser = await isAuthenticated();
        setUser(authUser);
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Bandhan - Student verification platform for education discounts" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Define primary color variables for the theme */}
        <style>
          {`
            :root {
              --color-primary: #c41b48;
              --color-primary-dark: #a01539;
              --color-secondary: #eb2026;
            }
            
            .bg-primary {
              background-color: var(--color-primary);
            }
            
            .hover\\:bg-primary-dark:hover {
              background-color: var(--color-primary-dark);
            }
            
            .text-primary {
              color: var(--color-primary);
            }
            
            .hover\\:text-primary-dark:hover {
              color: var(--color-primary-dark);
            }
            
            .border-primary {
              border-color: var(--color-primary);
            }
            
            .focus\\:ring-primary:focus {
              --tw-ring-color: var(--color-primary);
            }
            
            .focus\\:border-primary:focus {
              border-color: var(--color-primary);
            }
          `}
        </style>
      </Head>

      <Navbar user={user} loading={loading} />

      <main className="flex-grow bg-gray-50">
        {children}
      </main>

      <Footer />
    </div>
  );
}