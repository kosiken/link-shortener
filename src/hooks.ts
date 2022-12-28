import { useMutation } from 'react-query'

import { delayed } from './utils';

interface Result {
  code: string;
  short_link: string;
  full_short_link: string;
  short_link2: string;
  full_short_link2: string;
  share_link: string;
  full_share_link: string;
  original_link: string;
}

export interface ApiResponse {
  ok: boolean;
  result?: Result;

  error_code?: number;
  error?: string;
}



export function useShortenUrl() {
    const fetchShortened = async (data: string) => {
        // this is just a primitive delay function because 
        // 'api.shrtco.de/v2' only ratelimits 1 request/sec
        await delayed(1000);
        const response = await fetch('https://api.shrtco.de/v2/shorten?url' + data, {
        method: 'GET',
        })
        const responseData = (await response.json()) as  ApiResponse;
        if(!response.ok) {
            throw new Error(responseData.error);
        }
        return responseData.result!;
    
      }

      return useMutation(fetchShortened);
}