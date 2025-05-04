import { db } from "../../../server/db";
import { storage } from "../../../server/storage";

export default async function handler(req, res) {
  // Check for adminId parameter
  const { adminId } = req.query;
  if (!adminId) {
    return res.status(400).json({ error: "Admin ID is required" });
  }

  try {
    console.log(`Fetching school data for admin ID: ${adminId}`);
    
    // Get the school for this admin from the database
    const school = await storage.getSchoolByAdminId(parseInt(adminId));
    
    if (!school) {
      console.log(`No school found for admin ID: ${adminId}`);
      return res.status(404).json({ error: "No school found for this admin" });
    }
    
    console.log(`School data found:`, school);
    return res.status(200).json(school);
    
  } catch (error) {
    console.error("Error fetching school data:", error);
    return res.status(500).json({ error: "Failed to fetch school data" });
  }
}
