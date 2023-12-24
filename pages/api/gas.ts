import mempoolJS from "@mempool/mempool.js";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function getTX(
  req: NextApiRequest,
  res: NextApiResponse<any | { message: string }>
) {
  if (req.method === 'GET') {
    try {
        const { bitcoin: { fees } } = mempoolJS({
            hostname: 'mempool.space'
        });
        
        const feesRecommended = await fees.getFeesRecommended();

        res.status(200).json(feesRecommended);
      
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
