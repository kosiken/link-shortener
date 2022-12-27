import React from 'react';
import { QueryClient, QueryClientProvider, useMutation } from 'react-query'
import axios, { AxiosError } from 'axios';
import Button from './components/Button';
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

interface ApiResponse {
  ok: boolean;
  result: Result;
}
interface ErrorResponse {
  ok: boolean;
  error_code: number;
  error: string;
}



const queryClient = new QueryClient();

const Shortener = () => {

  const [link, setLink] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('')
  const fetchShortened = async (data: string) => {
    await delayed(1000);
    const response = await axios.get<ApiResponse>('https://api.shrtco.de/v2/shorten', {
      params: {
        url: data,
      }
    })

    return response.data.result;

  }



  const { isError, isLoading, isSuccess, mutate, data, error } = useMutation(fetchShortened);

  React.useEffect(() => {
    if(error) {
      const axiosError = error as  AxiosError<ErrorResponse>;
      if(axiosError.response) {
        setErrorMessage(axiosError.response.data.error);
      }
    }
  }, [error])
  const onChange: React.InputHTMLAttributes<HTMLInputElement>['onChange'] = e => {
    setLink(e.target.value);
  }

  const onSubmit = () => {
      setErrorMessage('')
      mutate(link)
  }

  return (
    <div className="card max-w-[500px] w-full bg-cardBg rounded dark	px-8 py-4" style={{
      boxShadow: 'inset 0 1px 0 0 hsl(0deg 0% 100% / 5%)'
    }}>

      <input className="block mb-4 bg-transparent w-full outline-none text-sky-400 h-[3.5rem] flex-auto appearance-none" placeholder="Enter your link" onChange={onChange} value={link} />
      <Button disabled={!link || isLoading} onClick={onSubmit}> Shorten </Button>

    {
      isLoading && (
        <p className="mt-2 text-white">Loading...</p>
      )
    }

{
      errorMessage && (
        <p className="mt-2 text-red-600	">{errorMessage}</p>
      )
    }


{!!data && (      <div className="py-2 mt-2 ">
        <div>
        <p className="text-orange-50 ">
          Short Link 1
        </p>
        <p className="text-sky-400">
          {data.full_short_link}
        </p>
        </div>

        <div>
        <p className="text-orange-50 ">
          Short Link 2
        </p>
        <p className="text-sky-400">
          {data.full_short_link2}
        </p>
        </div>
      </div>)}
    </div>
  )
}

function App() {


  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-slate-900 w-full h-full flex justify-center items-center">
        <Shortener />
      </div>
    </QueryClientProvider>

  );
}

export default App;
