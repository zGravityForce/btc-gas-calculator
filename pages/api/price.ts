import type { NextApiRequest, NextApiResponse } from 'next';



import axios, { AxiosInstance } from 'axios';

const bnApiInstance: AxiosInstance = axios.create({
  baseURL: 'https://api.binance.com/api/v3', // Use your API base URL
  // Other global settings
});

// Optionally add global request or response interceptors
bnApiInstance.interceptors.request.use(
  config => {
    // Modify or add config settings
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
``
interface ApiResponse {
    data: {
        mins: number,
        price: string,
        closeTime: number,
    };
    // Any other fields you expect in your response
}


export default async function getPrice(
    req: NextApiRequest,
    res: NextApiResponse<any | { message: string }>
  ) {
    if (req.method === 'GET') {
      try {

        const { symbol  } = req.query as { // BTCUSDT
            symbol: string;
        };

        const response = await bnApiInstance.get<ApiResponse>(`/avgPrice?symbol=${symbol}`)

        res.status(200).json(response.data);
          
        
      } catch (error) {
          res.status(500).json({ message: 'An unexpected error occurred' });
      
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  }
  