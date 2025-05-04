import { isAdmin } from '../../../utils/auth';
import { db } from '../../../server/db';
import { discountApplications } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  // Check if the user is an admin
  if (!await isAdmin()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { schoolId } = req.query;
  
  if (!schoolId) {
    return res.status(400).json({ error: 'School ID is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get discount applications for a specific school
      const applications = await db.select()
        .from(discountApplications)
        .where(eq(discountApplications.schoolId, parseInt(schoolId)));
      
      return res.status(200).json({ applications });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling discount applications request:', error);
    return res.status(500).json({ error: 'An error occurred while processing your request' });
  }
}