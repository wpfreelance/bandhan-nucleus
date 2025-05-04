// Persistence and authentication utilities

// Check if code is running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Key constants for localStorage
const AUTH_USER_KEY = 'bandhan_auth_user';
const AUTH_USER_KEY_LEGACY = 'auth_user';
const USER_KEY = 'user';
const USER_ROLE_KEY = 'userRole';
const FIRST_LOGIN_KEY = 'firstLogin';

// Development mode shortcuts
const DEV_MODE = process.env.NODE_ENV === 'development';
const DEV_OTP_CODE = '123456'; // For testing purposes only

// Basic authentication check - returns the user object if authenticated
export const isAuthenticated = () => {
  return new Promise((resolve, reject) => {
    if (!isBrowser) {
      return resolve(null);
    }
    
    try {
      // Check in order of priority for all possible auth storage locations
      
      // 1. Modern Firebase auth user
      const firebaseUser = localStorage.getItem(USER_KEY);
      if (firebaseUser) {
        const user = JSON.parse(firebaseUser);
        console.log('User authenticated with Firebase auth', user);
        return resolve(user);
      }
      
      // 2. Legacy auth user
      const legacyUser = localStorage.getItem(AUTH_USER_KEY_LEGACY);
      if (legacyUser) {
        const user = JSON.parse(legacyUser);
        console.log('User authenticated with legacy auth', user);
        return resolve(user);
      }
      
      // 3. Original app auth
      const authUser = localStorage.getItem(AUTH_USER_KEY);
      if (authUser) {
        const user = JSON.parse(authUser);
        console.log('User authenticated with original auth', user);
        return resolve(user);
      }
      
      // No authentication found
      console.log('No authentication found');
      return resolve(null);
    } catch (error) {
      console.error('Auth check error:', error);
      return reject(error);
    }
  });
};

// Get the current authenticated user
export const getCurrentUser = () => {
  if (!isBrowser) {
    return null;
  }
  
  try {
    // Check in order of priority for all possible auth storage locations
    
    // 1. Modern Firebase auth user
    const firebaseUser = localStorage.getItem(USER_KEY);
    if (firebaseUser) {
      return JSON.parse(firebaseUser);
    }
    
    // 2. Legacy auth user
    const legacyUser = localStorage.getItem(AUTH_USER_KEY_LEGACY);
    if (legacyUser) {
      return JSON.parse(legacyUser);
    }
    
    // 3. Original app auth
    const authUser = localStorage.getItem(AUTH_USER_KEY);
    if (authUser) {
      return JSON.parse(authUser);
    }
    
    // No authentication found
    return null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

// Logout user
export const logout = async () => {
  if (!isBrowser) {
    return;
  }
  
  try {
    // Clear all possible auth storage locations
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_USER_KEY_LEGACY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(FIRST_LOGIN_KEY);
    console.log('User logged out successfully');
    
    // In a real app, we would also call Firebase auth signOut method
    // await firebase.auth().signOut();
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Check if the current user is an admin
export const isAdmin = async () => {
  if (!isBrowser) {
    return false;
  }
  
  try {
    // First check the direct role property in user objects
    const user = await getCurrentUser();
    if (user && user.role === 'admin') {
      return true;
    }
    
    // Fallback to the separate role storage
    const role = localStorage.getItem(USER_ROLE_KEY);
    return role === 'admin';
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
};

// Check if the current user is a student
export const isStudent = async () => {
  if (!isBrowser) {
    return false;
  }
  
  try {
    // First check the direct role property in user objects
    const user = await getCurrentUser();
    
    // Admin users are not students
    if (user && user.role === 'admin') {
      return false;
    }
    
    // Firebase auth users with a phone number are students
    if (user && user.phoneNumber) {
      return true;
    }
    
    // If user has explicit student role
    if (user && user.role === 'student') {
      return true;
    }
    
    // Fallback to the separate role storage
    const role = localStorage.getItem(USER_ROLE_KEY);
    return role === 'student';
  } catch (error) {
    console.error('Student check error:', error);
    return false;
  }
};

// Set the user role in localStorage
export const setUserRole = (role) => {
  if (!isBrowser || !role) {
    return;
  }
  
  try {
    localStorage.setItem(USER_ROLE_KEY, role);
  } catch (error) {
    console.error('Set role error:', error);
  }
};

// Check if this is the first login after authentication
export const isFirstLogin = () => {
  if (!isBrowser) {
    return false;
  }
  
  try {
    return localStorage.getItem(FIRST_LOGIN_KEY) === 'true';
  } catch (error) {
    console.error('First login check error:', error);
    return false;
  }
};

// Mark login process as complete (no longer first login)
export const markLoginComplete = () => {
  if (!isBrowser) {
    return;
  }
  
  try {
    localStorage.removeItem(FIRST_LOGIN_KEY);
  } catch (error) {
    console.error('Mark login complete error:', error);
  }
};

// Store user authentication data after successful phone verification
export const setAuthenticatedUser = (phoneNumber) => {
  if (!isBrowser || !phoneNumber) {
    return;
  }
  
  try {
    // Create user object similar to Firebase Auth user object
    const user = {
      uid: `dev-uid-${Date.now()}`,
      id: `dev-uid-${Date.now()}`,
      phoneNumber,
      phone: phoneNumber,
      role: 'student',
      isAnonymous: false,
      providerData: [
        {
          providerId: 'phone',
          phoneNumber
        }
      ]
    };
    
    // Store auth data in all locations for compatibility
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_USER_KEY_LEGACY, JSON.stringify(user));
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(USER_ROLE_KEY, 'student'); // Default role for phone auth
    localStorage.setItem(FIRST_LOGIN_KEY, 'true'); // Mark as first login
    
    return user;
  } catch (error) {
    console.error('Set authenticated user error:', error);
    throw error;
  }
};

// Validate OTP code - simulated in development mode
export const validateOTP = (code, expectedCode = DEV_OTP_CODE) => {
  if (DEV_MODE) {
    // In development, accept any code if it matches DEV_OTP_CODE
    const isValid = code === expectedCode;
    
    if (isValid) {
      console.log('OTP validation successful in development mode');
    } else {
      console.log(`OTP validation failed: Expected "${expectedCode}", got "${code}"`);
    }
    
    return isValid;
  }
  
  console.log('OTP validation in production mode not implemented');
  // In production, this would validate with Firebase
  return false;
};