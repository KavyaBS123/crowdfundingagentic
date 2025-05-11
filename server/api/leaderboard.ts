import { db } from '@/lib/db';
import { donors } from '@/lib/schema';
import { desc, gte } from 'drizzle-orm';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { filter } = req.query;
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    let query = db.select().from(donors);

    // Apply filters
    switch (filter) {
      case 'weekly':
        query = query.where(gte(donors.lastDonationTime, oneWeekAgo));
        break;
      case 'streak':
        query = query.orderBy(desc(donors.streakCount));
        break;
      default: // 'all'
        query = query.orderBy(desc(donors.xp));
    }

    const leaderboardData = await query.limit(10);

    // Format the response
    const formattedData = leaderboardData.map(donor => ({
      address: donor.address,
      xp: donor.xp,
      level: donor.level,
      streakCount: donor.streakCount,
      lastDonationTime: donor.lastDonationTime
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 