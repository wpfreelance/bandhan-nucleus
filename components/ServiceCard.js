import { useState } from 'react';
import Link from 'next/link';

export default function ServiceCard({ service, discountApplied = false, onAddToCart }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate discounted price if applicable
  const originalPrice = parseFloat(service.price);
  const discountedPrice = discountApplied ? originalPrice * 0.7 : originalPrice; // 30% discount
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      {service.image && (
        <div className="h-48 overflow-hidden">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.name}</h3>
          {service.category && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
              {service.category}
            </span>
          )}
        </div>
        
        <div className="flex items-center mt-2 mb-4">
          {discountApplied ? (
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-800">{formatCurrency(discountedPrice)}</span>
              <span className="ml-2 text-sm text-gray-500 line-through">{formatCurrency(originalPrice)}</span>
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                30% OFF
              </span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-gray-800">{formatCurrency(originalPrice)}</span>
          )}
        </div>
        
        <div className={`text-gray-600 text-sm ${isExpanded ? '' : 'line-clamp-3'}`}>
          {service.description || 'No description available for this service.'}
        </div>
        
        {service.description && service.description.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-800"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 mb-4">
            {service.features && service.features.map((feature, index) => (
              <span key={index} className="inline-flex items-center text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </span>
            ))}
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => onAddToCart && onAddToCart(service)}
              className="w-full bg-blue-600 text-white flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add to Cart
            </button>
            
            <div className="flex space-x-2">
              <a
                href={`https://nucleusdiagnosticscentre.com/product/${service.slug || service.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white border border-blue-600 text-blue-600 text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                Details
              </a>
              <a
                href={`https://nucleusdiagnosticscentre.com/home-collection-services/?service=${service.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white border border-gray-300 text-gray-700 text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Home Collection
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
