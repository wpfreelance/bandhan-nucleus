import { db } from "../../../server/db";
import { storage } from "../../../server/storage";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { studentId, status, adminId } = req.body;
    
    if (!studentId || !status || !adminId) {
      return res.status(400).json({ error: "Required fields missing" });
    }
    
    try {
      console.log(`Updating student ID: ${studentId} to status: ${status}`);
      
      // First get the student to verify they exist
      const student = await storage.getStudent(parseInt(studentId));
      
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      // Then update the student status
      const updatedStudent = await storage.updateStudent(student.id, {
        status: status
      });
      
      console.log(`Student status updated successfully for ID: ${studentId}`);
      return res.status(200).json(updatedStudent);
      
    } catch (error) {
      console.error("Error updating student:", error);
      return res.status(500).json({ error: "Failed to update student status" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
