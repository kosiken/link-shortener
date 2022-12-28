import { act, renderHook, waitFor, render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { setLogger } from 'react-query'
import { Shortener } from './App';

import { ApiResponse, useShortenUrl } from './hooks';
import { delayed } from './utils';

// sample response data
let data = JSON.parse(`
{
    "ok": true,
    "result": {
        "code": "Jb5aq",
        "short_link": "shrtco.de/Jb5aq",
        "full_short_link": "https://shrtco.de/Jb5aq",
        "short_link2": "9qr.de/Jb5aq",
        "full_short_link2": "https://9qr.de/Jb5aq",
        "short_link3": "shiny.link/Jb5aq",
        "full_short_link3": "https://shiny.link/Jb5aq",
        "share_link": "shrtco.de/share/Jb5aq",
        "full_share_link": "https://shrtco.de/share/Jb5aq",
        "original_link": "http:// https://github.com/kosiken"
    }
}
`) as ApiResponse

describe('Shortener tests', () => {
    // example url to shorten
    const url = 'https://github.com/kosiken';
    let wrapper: ({ children }: any) => JSX.Element;
    let queryClient: QueryClient;
    beforeEach(() => {
        setLogger({
            log: console.log,
            warn: console.warn,
            // no more errors on the console
            error: () => { },
        });

        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    // turns retries off
                    retry: false,
                },
            },
        });

        // mock fetch function for tests
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data),
            })
        ) as any;

        wrapper = ({ children }: any) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );

    })
    it('should run hook successfully', async function () {


        const { result, } = renderHook(() => useShortenUrl(), { wrapper });

        act(() => {
            result.current.mutate(url);
        });
        await waitFor(() => {
            // we have this delay because of the rate limiter put inside the hook
            return delayed(1500);
        }, {
            timeout: 3000
        });
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).not.toBeUndefined();
        expect(result.current.data).toMatchObject(data.result!);

    })

    it('Should render shortener component', async function () {
        render(<Shortener />, { wrapper })
        const input = screen.getByTestId<HTMLInputElement>('url-input');
        const button = screen.getByTestId<HTMLButtonElement>('submit-button');
        expect(input).toBeInTheDocument();
        expect(button).toBeInTheDocument()
        expect(button.disabled).toBeTruthy();
    })

    it('Should shorten the url on click shorten "button"', async function () {
        render(<Shortener />, { wrapper })
        const input = screen.getByTestId<HTMLInputElement>('url-input');
        const button = screen.getByTestId<HTMLButtonElement>('submit-button');
        fireEvent.change(input, { target: { value: url } })

        expect(button.disabled).toBeFalsy();
        fireEvent.click(button);
        await waitFor(() => {
            return screen.getByText('Loading...')
        })
        const loadingText = screen.getByTestId('loading-text');
        expect(loadingText).toBeInTheDocument();
        await waitFor(() => {
            return screen.getByText('Short Link 1')

        })

        const results = screen.getByTestId('results');
        expect(results).toBeInTheDocument();
        expect(loadingText).not.toBeInTheDocument();

    })

    it('Should not shorten invalid urls', async function () {
        render(<Shortener />, { wrapper })
        const input = screen.getByTestId<HTMLInputElement>('url-input');
        const button = screen.getByTestId<HTMLButtonElement>('submit-button');
        fireEvent.change(input, { target: { value: 'invalid' } })

        expect(button.disabled).toBeFalsy();
        fireEvent.click(button);
        await waitFor(() => {
            return screen.getByText('Invalid url')
        })
        const errorText = screen.getByTestId('error-text');
        expect(errorText).toBeInTheDocument();

    });

    it('Should display error message', async function () {
        const error = 'An error';
        // mock an error response
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({
                    error_code: 1000,
                    error
                }),
            })) as any;
        render(<Shortener />, { wrapper })

        const input = screen.getByTestId<HTMLInputElement>('url-input');
        const button = screen.getByTestId<HTMLButtonElement>('submit-button');
        fireEvent.change(input, { target: { value: url } })

        expect(button.disabled).toBeFalsy();
        fireEvent.click(button);

        await waitFor(() => {
            return screen.getByTestId('error-text');

        }, {
            // wait for rate limit delay to be fully executed before giving up
            timeout: 1500
        })

        const errorText = screen.getByText(error);
        expect(errorText).toBeInTheDocument();

    })
})