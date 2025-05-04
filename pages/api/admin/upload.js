import { db } from "../../../server/db";
import { storage } from "../../../server/storage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { students, adminId } = req.body;

  if (!students || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: "No valid student data provided" });
  }

  if (!adminId) {
    return res.status(400).json({ message: "Admin ID is required" });
  }

  try {
    console.log(`Received ${students.length} students for admin ID: ${adminId}`);

    // Get the school for this admin
    const school = await storage.getSchoolByAdminId(parseInt(adminId));
    
    if (!school) {
      return res.status(404).json({ message: "School not found for this admin" });
    }
    
    console.log(`Found school: ${school.name} (ID: ${school.id})`);

    // Process students in chunks to avoid overwhelming the database
    const chunkSize = 50;
    let processedCount = 0;
    let errorCount = 0;
    
    // Process students in batches
    for (let i = 0; i < students.length; i += chunkSize) {
      const chunk = students.slice(i, i + chunkSize);
      
      // Process each student in the chunk
      for (const studentData of chunk) {
        try {
          // Format the phone number properly if needed
          let phone = studentData.phone;
          if (phone && !phone.startsWith("+")) {
            // Add the country code if missing
            phone = `+91${phone.replace(/[^0-9]/g, "")}`;
          }
          
          // Check if student with this phone already exists
          const existingStudent = await storage.getStudentByPhone(phone);
          
          if (existingStudent) {
            // Update existing student
            console.log(`Updating existing student: ${existingStudent.id} with phone ${phone}`);
            
            await storage.updateStudent(existingStudent.id, {
              firstName: studentData.name.split(" ")[0],
              lastName: studentData.name.split(" ").slice(1).join(" "),
              fatherName: studentData.fatherName,
              schoolId: school.id,
              class: studentData.class,
              rollNumber: studentData.rollNo,
              gender: studentData.gender,
              dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : null,
              address: `${studentData.addressLine1}, ${studentData.addressLine2}`,
              state: studentData.state,
              postalCode: studentData.postalCode,
              email: studentData.email
            });
          } else {
            // Create new student
            console.log(`Creating new student with phone ${phone}`);
            
            await storage.createStudent({
              firstName: studentData.name.split(" ")[0],
              lastName: studentData.name.split(" ").slice(1).join(" "),
              fatherName: studentData.fatherName,
              schoolId: school.id,
              class: studentData.class,
              rollNumber: studentData.rollNo,
              gender: studentData.gender,
              dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : null,
              address: `${studentData.addressLine1}, ${studentData.addressLine2}`,
              state: studentData.state,
              postalCode: studentData.postalCode,
              email: studentData.email,
              phone: phone,
              status: "pending",
              selfieUrl: studentData.photo || null
            });
          }
          
          processedCount++;
        } catch (error) {
          console.error(`Error processing student: ${error.message}`);
          errorCount++;
        }
      }
    }
    
    return res.status(200).json({
      message: `Processed ${processedCount} students successfully. ${errorCount} errors.`,
      processed: processedCount,
      errors: errorCount
    });
  } catch (error) {
    console.error("Error processing students:", error);
    return res.status(500).json({ message: "Error processing student data", error: error.message });
  }
}
