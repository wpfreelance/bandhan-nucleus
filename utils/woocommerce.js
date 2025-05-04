import axios from 'axios';

// Base URL for the WooCommerce site
const BASE_URL = 'https://nucleusdiagnosticscentre.com/wp-json/wc/v3';

// Function to fetch products from the main website
export const fetchProducts = async (category = '', page = 1, perPage = 10) => {
  try {
    // Get consumer key and secret from environment variables
    const consumerKey = process.env.WC_CONSUMER_KEY;
    const consumerSecret = process.env.WC_CONSUMER_SECRET;
    
    if (!consumerKey || !consumerSecret) {
      console.error('WooCommerce API credentials missing');
      throw new Error('WooCommerce API credentials are required');
    }
    
    const response = await axios.get(`${BASE_URL}/products`, {
      params: {
        category,
        page,
        per_page: perPage,
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Function to fetch categories
export const fetchCategories = async () => {
  try {
    // Get consumer key and secret from environment variables
    const consumerKey = process.env.WC_CONSUMER_KEY;
    const consumerSecret = process.env.WC_CONSUMER_SECRET;
    
    if (!consumerKey || !consumerSecret) {
      console.error('WooCommerce API credentials missing');
      throw new Error('WooCommerce API credentials are required');
    }
    
    const response = await axios.get(`${BASE_URL}/products/categories`, {
      params: {
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Function to apply discount to a student's account
export const applyStudentDiscount = async (studentId, phone) => {
  try {
    // Get consumer key and secret from environment variables
    const consumerKey = process.env.WC_CONSUMER_KEY;
    const consumerSecret = process.env.WC_CONSUMER_SECRET;
    
    if (!consumerKey || !consumerSecret) {
      console.error('WooCommerce API credentials missing');
      throw new Error('WooCommerce API credentials are required');
    }
    
    // Create a customer record with student discount metadata
    const response = await axios.post(`${BASE_URL}/customers`, {
      email: `${studentId}@student.verify.com`,
      phone: phone,
      meta_data: [
        {
          key: 'student_discount',
          value: '30'
        },
        {
          key: 'verified_student',
          value: 'true'
        }
      ]
    }, {
      params: {
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error applying student discount:', error);
    throw error;
  }
};

// Function to check if a phone number is eligible for discount
export const checkDiscountEligibility = async (phone) => {
  try {
    // Get consumer key and secret from environment variables
    const consumerKey = process.env.WC_CONSUMER_KEY;
    const consumerSecret = process.env.WC_CONSUMER_SECRET;
    
    if (!consumerKey || !consumerSecret) {
      console.error('WooCommerce API credentials missing');
      throw new Error('WooCommerce API credentials are required');
    }
    
    // Query WooCommerce customer database by phone number
    const response = await axios.get(`${BASE_URL}/customers`, {
      params: {
        phone: phone,
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      }
    });
    
    if (response.data && response.data.length > 0) {
      const customer = response.data[0];
      const metaData = customer.meta_data || [];
      
      const isVerified = metaData.find(meta => meta.key === 'verified_student' && meta.value === 'true');
      const discountMeta = metaData.find(meta => meta.key === 'student_discount');
      
      return {
        isEligible: !!isVerified,
        discountPercentage: discountMeta ? discountMeta.value : 0
      };
    }
    
    return { isEligible: false, discountPercentage: 0 };
  } catch (error) {
    console.error('Error checking discount eligibility:', error);
    throw error;
  }
};
