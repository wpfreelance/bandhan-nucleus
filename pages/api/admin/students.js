import { db } from "../../../server/db";
import { storage } from "../../../server/storage";

export default async function handler(req, res) {
  // Check for schoolId or adminId parameter
  const { schoolId, adminId } = req.query;
  
  try {
    let schoolIdToUse = schoolId;
    
    // If adminId is provided but not schoolId, get the school for this admin
    if (adminId && !schoolId) {
      console.log(`Fetching school for admin ID: ${adminId}`);
      const school = await storage.getSchoolByAdminId(parseInt(adminId));
      
      if (!school) {
        console.log(`No school found for admin ID: ${adminId}`);
        return res.status(200).json({ students: [] });
      }
      
      schoolIdToUse = school.id;
      console.log(`Found school ID ${schoolIdToUse} for admin ID: ${adminId}`);
    }
    
    if (!schoolIdToUse) {
      return res.status(400).json({ error: "Either School ID or Admin ID is required" });
    }

    console.log(`Fetching students for school ID: ${schoolIdToUse}`);
    
    // Get all students for this school from the database
    const students = await storage.getStudentsBySchool(parseInt(schoolIdToUse));
    
    console.log(`Found ${students.length} students for school ID: ${schoolIdToUse}`);
    return res.status(200).json({ students });
    
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({ error: "Failed to fetch students data" });
  }
}
