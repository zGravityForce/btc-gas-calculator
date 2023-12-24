import mempoolJS from "@mempool/mempool.js";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function getTX(
  req: NextApiRequest,
  res: NextApiResponse<any | { message: string }>
) {
  if (req.method === 'GET') {
    try {

        const { txId  } = req.query as {
            txId: string;
          };

        const { bitcoin: { transactions } } = mempoolJS({
          hostname: 'mempool.space'
        });
      
        const tx = await transactions.getTx({ txid: txId });
        // console.log(tx);
          
        // const { bitcoin: { fees } } = mempoolJS({
        //     hostname: 'mempool.space'
        //   });
        
        // const feesCPFP = await fees.getCPFP({ txid: txId });

        res.status(200).json(tx);
      
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
