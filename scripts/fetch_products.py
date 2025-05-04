import sys
import json
import traceback
import os
import requests

# Import fallback in case API call fails
try:
    from fetch_fallback import get_fallback_services
except ImportError:
    # Define the fallback directly if we can't import it
    def get_fallback_services():
        return {"services": [
            {
                "id": "1",
                "name": "Complete Blood Count (CBC)",
                "price": "500",
                "description": "A complete blood count (CBC) is a blood test used to evaluate your overall health.",
                "category": "Blood Tests",
                "image": "https://images.unsplash.com/photo-1503676382389-4809596d5290",
                "features": ["Results in 24 hours", "No fasting required"],
                "slug": "complete-blood-count"
            },
            {
                "id": "2",
                "name": "Lipid Profile",
                "price": "800",
                "description": "A lipid profile is a blood test that measures fats in your body.",
                "category": "Blood Tests",
                "image": "https://images.unsplash.com/photo-1530099486328-e021101a494a",
                "features": ["Fasting required", "Results in 24 hours"],
                "slug": "lipid-profile"
            }
        ]}

def fetch_products_from_woocommerce():
    """
    Fetch products directly from the WooCommerce API using the provided credentials
    Returns a structured list of pathology service products
    """
    try:
        # Get WooCommerce credentials from environment variables
        consumer_key = os.environ.get('WC_CONSUMER_KEY')
        consumer_secret = os.environ.get('WC_CONSUMER_SECRET')
        
        if not consumer_key or not consumer_secret:
            print("WooCommerce API credentials missing, using fallback data", file=sys.stderr)
            return get_fallback_services()
        
        # The WooCommerce REST API endpoint
        url = "https://nucleusdiagnosticscentre.com/wp-json/wc/v3/products"
        
        # Parameters for the API request
        params = {
            'consumer_key': consumer_key,
            'consumer_secret': consumer_secret,
            'per_page': 50,  # Fetch up to 50 products
            'status': 'publish'  # Only published products
        }
        
        # Make the API request
        response = requests.get(url, params=params)
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"API request failed with status code {response.status_code}, using fallback data", file=sys.stderr)
            return get_fallback_services()
        
        # Parse the response
        wc_products = response.json()
        
        # Transform WooCommerce products into our format
        products = []
        
        for product in wc_products:
            # Extract features from product attributes if available
            features = []
            if 'attributes' in product:
                for attr in product['attributes']:
                    if attr['name'] == 'Features' and 'options' in attr:
                        features = attr['options']
            
            # If no features were found, provide some default ones
            if not features:
                features = ["Professional analysis", "Quick results", "Home collection available"]
            
            # Create our product object
            service = {
                "id": str(product['id']),
                "name": product['name'],
                "price": str(product['price']) if 'price' in product else "Contact for price",
                "description": product['description'] if product['description'] else product['short_description'],
                "category": product['categories'][0]['name'] if product['categories'] else "Pathology Tests",
                "image": product['images'][0]['src'] if product['images'] else "https://via.placeholder.com/150",
                "features": features,
                "slug": product['slug']
            }
            
            products.append(service)
        
        # If we couldn't find products, use fallback
        if not products:
            print("No products found in WooCommerce API, using fallback data", file=sys.stderr)
            return get_fallback_services()
            
        return {"services": products}
        
    except Exception as e:
        print(f"Error fetching products from WooCommerce: {str(e)}", file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)
        # Return fallback data
        return get_fallback_services()

if __name__ == "__main__":
    # Get the services data from WooCommerce API
    products_data = fetch_products_from_woocommerce()
    
    # Output as JSON
    print(json.dumps(products_data, indent=2))