// API endpoint for fetching services from the Nucleus Diagnostics Centre website
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

// Cache management
let servicesCache = null;
let lastFetchTime = null;
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

const execAsync = promisify(exec);

// Execute the Python script to fetch products from WooCommerce API
async function fetchProductsFromWooCommerce() {
  try {
    // Check if we have a valid cache
    if (servicesCache && lastFetchTime && (Date.now() - lastFetchTime < CACHE_EXPIRY)) {
      console.log('Returning cached services data');
      return servicesCache;
    }
    
    // Path to the Python script that uses WooCommerce API
    const scriptPath = path.join(process.cwd(), 'scripts', 'fetch_products.py');
    
    // Make sure the WooCommerce credentials are accessible to the script
    const env = Object.assign({}, process.env);
    
    // Execute the Python script with the environment variables
    try {
      const { stdout, stderr } = await execAsync(`python ${scriptPath}`, { env });
      if (stderr) {
        console.error(`Python script warning: ${stderr}`);
      }
      
      // Parse the output as JSON
      const data = JSON.parse(stdout);
      
      // Update the cache
      servicesCache = data;
      lastFetchTime = Date.now();
      
      return data;
    } catch (execError) {
      console.error('Error executing Python script:', execError);
      
      // If execution fails, try to read the backup data file if it exists
      const backupPath = path.join(process.cwd(), 'data', 'services.json');
      try {
        const backupData = await fs.readFile(backupPath, 'utf8');
        return JSON.parse(backupData);
      } catch (fsError) {
        console.error('Error reading backup data:', fsError);
        
        // If all else fails, return default services
        return getDefaultServices();
      }
    }
  } catch (error) {
    console.error('Error in fetchProductsFromWooCommerce:', error);
    return getDefaultServices();
  }
}

// Default services to use as a fallback
function getDefaultServices() {
  return {
    services: [
      {
        id: '1',
        name: 'Complete Blood Count (CBC)',
        price: '500',
        description: 'A complete blood count (CBC) is a blood test used to evaluate your overall health and detect a wide range of disorders, including anemia, infection and leukemia.',
        category: 'Blood Tests',
        image: 'https://images.unsplash.com/photo-1503676382389-4809596d5290',
        features: ['Results in 24 hours', 'No fasting required', 'Home collection available'],
        slug: 'complete-blood-count'
      },
      {
        id: '2',
        name: 'Lipid Profile',
        price: '800',
        description: 'A lipid profile is a blood test that measures lipids—fats and fatty substances used as a source of energy by your body. This test is used to assess your risk of developing cardiovascular disease.',
        category: 'Blood Tests',
        image: 'https://images.unsplash.com/photo-1530099486328-e021101a494a',
        features: ['Fasting required', 'Results in 24 hours', 'Comprehensive report'],
        slug: 'lipid-profile'
      },
      {
        id: '3',
        name: 'Liver Function Test',
        price: '700',
        description: 'Liver function tests are blood tests that measure different enzymes, proteins, and substances made by the liver. These tests check the overall health of your liver.',
        category: 'Blood Tests',
        image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1',
        features: ['No fasting required', 'Results in 24 hours', 'Detailed analysis'],
        slug: 'liver-function-test'
      },
      {
        id: '4',
        name: 'Thyroid Profile',
        price: '900',
        description: 'A thyroid profile is a group of tests that may be ordered together to help evaluate thyroid gland function and to help diagnose thyroid disorders.',
        category: 'Hormone Tests',
        image: 'https://images.unsplash.com/photo-1454789476662-53eb23ba5907',
        features: ['No fasting required', 'Results in 48 hours', 'Expert evaluation'],
        slug: 'thyroid-profile'
      }
    ]
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get services from WooCommerce API via Python script
    const data = await fetchProductsFromWooCommerce();
    
    if (!data || !data.services || !Array.isArray(data.services)) {
      console.log('Invalid data format received, using default services');
      const defaultData = getDefaultServices();
      return res.status(200).json({ services: defaultData.services });
    }
    
    // Apply student discount to all services
    const discountedServices = data.services.map(service => {
      // Clone the service
      const discountedService = { ...service };
      
      // Calculate the discounted price (if price is numeric)
      const originalPrice = parseFloat(service.price);
      if (!isNaN(originalPrice)) {
        // Apply 30% discount
        const discountedPrice = Math.round(originalPrice * 0.7);
        discountedService.originalPrice = service.price;
        discountedService.price = discountedPrice.toString();
        discountedService.discountPercentage = '30%';
      }
      
      return discountedService;
    });
    
    // Create a directory to cache the data for future use
    try {
      await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
      await fs.writeFile(
        path.join(process.cwd(), 'data', 'services.json'), 
        JSON.stringify({ services: discountedServices, timestamp: Date.now() })
      );
    } catch (fsError) {
      console.error('Error writing services cache file:', fsError);
    }
    
    return res.status(200).json({ services: discountedServices });
  } catch (error) {
    console.error('Error fetching services:', error);
    return res.status(500).json({ message: 'Error fetching services' });
  }
}
