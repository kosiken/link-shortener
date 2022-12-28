import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query'
import Button from './components/Button';
import { useShortenUrl } from './hooks';


const queryClient = new QueryClient();

export const Shortener = () => {

  const [link, setLink] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('')

  // regExp from https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
  const regExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;



  const { isLoading, mutate, data, error } = useShortenUrl();

  React.useEffect(() => {
    if(error) {
      const theError = error as  Error;
        setErrorMessage(theError.message);
    }
  }, [error])
  const onChange: React.InputHTMLAttributes<HTMLInputElement>['onChange'] = e => {
    setLink(e.target.value);
  }

  const onSubmit = () => {
      if(!regExp.test(link)) {
        setErrorMessage('Invalid url');
        return;
      }
      setErrorMessage('')
      mutate(link)
  }

  return (
    <div className="card max-w-[500px] w-full bg-cardBg rounded dark	px-8 py-4" style={{
      boxShadow: 'inset 0 1px 0 0 hsl(0deg 0% 100% / 5%)'
    }}>

      <input data-testid="url-input" className="block mb-4 bg-transparent w-full outline-none text-sky-400 h-[3.5rem] flex-auto appearance-none" placeholder="Enter your link" onChange={onChange} value={link} />
      <Button data-testid="submit-button" disabled={!link || isLoading} onClick={onSubmit}> Shorten </Button>

    {
      isLoading && (
        <p data-testid="loading-text" className="mt-2 text-white">Loading...</p>
      )
    }

{
      errorMessage && (
        <p data-testid="error-text" className="mt-2 text-red-600	">{errorMessage}</p>
      )
    }


{!!data && (      <div data-testid="results" className="py-2 mt-2 ">
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
