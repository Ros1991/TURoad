import { useCallback } from 'react';
import { toast as toastify, ToastOptions } from 'react-toastify';

export interface Toast {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  loading: (message: string, options?: ToastOptions) => void;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      pending?: string;
      success?: string;
      error?: string;
    },
    options?: ToastOptions
  ) => Promise<T>;
}

export const useToast = (): Toast => {
  const success = useCallback((message: string, options?: ToastOptions) => {
    toastify.success(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  const error = useCallback((message: string, options?: ToastOptions) => {
    toastify.error(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    toastify.warning(message, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  const info = useCallback((message: string, options?: ToastOptions) => {
    toastify.info(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  const loading = useCallback((message: string, options?: ToastOptions) => {
    return toastify.loading(message, {
      position: 'top-right',
      closeOnClick: false,
      ...options,
    });
  }, []);

  const promise = useCallback(
    async <T,>(
      promise: Promise<T>,
      messages: {
        pending?: string;
        success?: string;
        error?: string;
      },
      options?: ToastOptions
    ): Promise<T> => {
      return toastify.promise(
        promise,
        {
          pending: messages.pending || 'Loading...',
          success: messages.success || 'Success!',
          error: messages.error || 'Error occurred',
        },
        {
          position: 'top-right',
          ...options,
        }
      );
    },
    []
  );

  return {
    success,
    error,
    warning,
    info,
    loading,
    promise,
  };
};

export default useToast;
