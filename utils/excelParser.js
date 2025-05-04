import * as XLSX from 'xlsx';

// Helper function to standardize date formats
// Handles common formats like DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
const standardizeDate = (dateString) => {
  if (!dateString) return '';
  
  // If it's already a Date object
  if (dateString instanceof Date) {
    return dateString.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
  
  // If it's a string, try to parse it
  try {
    // Try to detect format and convert to YYYY-MM-DD
    const dateStr = dateString.toString().trim();
    
    // Check if it's in DD/MM/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Check if it's in DD-MM-YYYY format
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Try parsing with JavaScript Date
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    // If all attempts fail, return the original string
    return dateStr;
  } catch (error) {
    console.error('Error parsing date:', error);
    return dateString;
  }
};

// Function to validate the Excel structure matches the expected format
export const validateExcelStructure = (headers) => {
  const requiredHeaders = [
    'Photo',
    'Name',
    'Father\'s Name',
    'School name',
    'Class',
    'Roll no',
    'Gender',
    'Date Of Birth',
    'Address Line-1',
    'Address Line-2',
    'State',
    'Postal Code',
    'Email',
    'Phone'
  ];

  // Convert headers to lowercase for case-insensitive comparison
  const lowerCaseHeaders = headers.map(h => h.toLowerCase());
  const lowerCaseRequiredHeaders = requiredHeaders.map(h => h.toLowerCase());
  
  // Check if all required headers are present (case-insensitive)
  const missingHeaders = requiredHeaders.filter((header, index) => 
    !lowerCaseHeaders.includes(lowerCaseRequiredHeaders[index])
  );
  
  if (missingHeaders.length > 0) {
    return {
      valid: false,
      message: `Missing required columns: ${missingHeaders.join(', ')}`
    };
  }
  
  return {
    valid: true,
    message: 'Excel structure is valid'
  };
};

// Function to parse an Excel file and return structured data
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assume the first sheet is the one with student data
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Check if there's at least a header row and one data row
        if (jsonData.length < 2) {
          reject(new Error('Excel file must contain at least a header row and one data row'));
          return;
        }
        
        // Extract headers
        const headers = jsonData[0];
        
        // Validate the structure
        const validation = validateExcelStructure(headers);
        if (!validation.valid) {
          reject(new Error(validation.message));
          return;
        }
        
        // Map header indices with case-insensitive lookup
        const headerIndices = {};
        const headerMap = {};
        
        // Create a mapping of lowercase header to original header
        headers.forEach(header => {
          headerMap[header.toLowerCase()] = header;
        });
        
        // Map indices based on original headers
        headers.forEach((header, index) => {
          headerIndices[header] = index;
        });
        
        // Helper function to get index by header name (case-insensitive)
        const getHeaderIndex = (headerName) => {
          // Try exact match first
          if (headerIndices[headerName] !== undefined) {
            return headerIndices[headerName];
          }
          
          // Try case-insensitive match
          const mappedHeader = headerMap[headerName.toLowerCase()];
          if (mappedHeader && headerIndices[mappedHeader] !== undefined) {
            return headerIndices[mappedHeader];
          }
          
          return -1;
        };
        
        // Process data rows
        const students = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row.length === 0) continue; // Skip empty rows
          
          // Create student object with case-insensitive header lookup
          const nameIdx = getHeaderIndex('Name');
          const phoneIdx = getHeaderIndex('Phone');
          const rollNoIdx = getHeaderIndex('Roll no');
          
          // Get values using the indices
          const name = nameIdx >= 0 ? row[nameIdx] || '' : '';
          const phone = phoneIdx >= 0 ? row[phoneIdx] || '' : '';
          const rollNo = rollNoIdx >= 0 ? row[rollNoIdx] || '' : '';
          
          // Skip if essential fields are missing
          if (!name || !phone) continue;
          
          // Generate a username if not explicitly provided in the Excel
          let username = '';
          const usernameIdx = getHeaderIndex('Username');
          if (usernameIdx >= 0 && row[usernameIdx]) {
            username = row[usernameIdx];
          } else {
            // Create username from name and phone (last 4 digits)
            const namePart = name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const phonePart = phone.replace(/[^0-9]/g, '').slice(-4);
            username = `${namePart}${phonePart}`;
          }
          
          // Pre-compute all indices to avoid redundant lookups
          const fatherNameIdx = getHeaderIndex('Father\'s Name');
          const schoolNameIdx = getHeaderIndex('School name');
          const classIdx = getHeaderIndex('Class');
          const genderIdx = getHeaderIndex('Gender');
          const dobIdx = getHeaderIndex('Date Of Birth');
          const addr1Idx = getHeaderIndex('Address Line-1');
          const addr2Idx = getHeaderIndex('Address Line-2');
          const stateIdx = getHeaderIndex('State');
          const postalCodeIdx = getHeaderIndex('Postal Code');
          const emailIdx = getHeaderIndex('Email');
          const photoIdx = getHeaderIndex('Photo');
          
          const student = {
            name: name,
            fatherName: fatherNameIdx >= 0 ? row[fatherNameIdx] || '' : '',
            schoolName: schoolNameIdx >= 0 ? row[schoolNameIdx] || '' : '',
            class: classIdx >= 0 ? row[classIdx] || '' : '',
            rollNo: rollNo,
            gender: genderIdx >= 0 ? row[genderIdx] || '' : '',
            dateOfBirth: dobIdx >= 0 ? standardizeDate(row[dobIdx]) : '',
            addressLine1: addr1Idx >= 0 ? row[addr1Idx] || '' : '',
            addressLine2: addr2Idx >= 0 ? row[addr2Idx] || '' : '',
            state: stateIdx >= 0 ? row[stateIdx] || '' : '',
            postalCode: postalCodeIdx >= 0 ? row[postalCodeIdx] || '' : '',
            email: emailIdx >= 0 ? row[emailIdx] || '' : '',
            phone: phone,
            username: username,
            photo: photoIdx >= 0 ? row[photoIdx] || '' : '',
            isVerified: false,
            hasUploadedSelfie: false,
            selfieUrl: ''
          };
          
          students.push(student);
        }
        
        resolve(students);
      } catch (error) {
        reject(new Error(`Error parsing Excel file: ${error.message}`));
      }
    };
    
    reader.onerror = (error) => {
      reject(new Error('Error reading Excel file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};
