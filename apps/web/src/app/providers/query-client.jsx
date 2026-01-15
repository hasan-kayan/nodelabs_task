import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 401 errors - let interceptor handle redirect
        if (error?.response?.status === 401) {
          return false;
        }
        return failureCount < 1;
      },
      onError: (error) => {
        // Don't show error for 401 - interceptor will handle redirect
        if (error?.response?.status === 401) {
          console.log('🔒 401 error detected, interceptor will handle redirect');
          return;
        }
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on 401 errors
        if (error?.response?.status === 401) {
          return false;
        }
        return false; // Don't retry mutations by default
      },
      onError: (error) => {
        // Don't show error for 401 - interceptor will handle redirect
        if (error?.response?.status === 401) {
          console.log('🔒 401 error detected in mutation, interceptor will handle redirect');
          return;
        }
      },
    },
  },
});

export function QueryClientProvider({ children }) {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </TanStackQueryClientProvider>
  );
}
