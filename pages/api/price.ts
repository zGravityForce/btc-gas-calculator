// import type { NextApiRequest, NextApiResponse } from 'next';



// import axios, { AxiosInstance } from 'axios';


// interface ApiResponse {
//     data: {
//         mins: number,
//         price: string,
//         closeTime: number,
//     };
//     // Any other fields you expect in your response
// }


// export default async function getPrice(
//     req: NextApiRequest,
//     res: NextApiResponse<any | { message: string }>
//   ) {
//     if (req.method === 'GET') {
//       try {

//         const { symbol  } = req.query as { // BTCUSDT
//             symbol: string;
//         };

//         // const bnApiInstance: AxiosInstance = axios.create({
//         //   baseURL: 'https://api.binance.com/api/v3', // Use your API base URL
//         //   // Other global settings
//         // });
        
//         // // Optionally add global request or response interceptors
//         // bnApiInstance.interceptors.request.use(
//         //   config => {
//         //     // Modify or add config settings
//         //     return config;
//         //   },
//         //   error => {
//         //     return Promise.reject(error);
//         //   }
//         // );

//         // const response = await fetch(`https://api.binance.com/api/v3/avgPrice?symbol=${symbol}`);

//         const url = `https://api.binance.com/api/v3/avgPrice?symbol=${symbol}`;
//         const response = await axios.get(url);
//         const data = response.data as ApiResponse;
//         res.status(200).json(data);
          
        
//       } catch (error) {
//           res.status(500).json({ message: error });
      
//       }
//     } else {
//       res.setHeader('Allow', ['GET']);
//       res.status(405).json({ message: `Method ${req.method} Not Allowed` });
//     }
//   }
  