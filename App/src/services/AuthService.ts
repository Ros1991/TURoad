import { User } from "../types";
import { mockedUser } from "../mocks";

export const login = async (email: string, password: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === "test@example.com" && password === "password") {
        resolve(mockedUser);
      } else {
        resolve(null);
      }
    }, 1000);
  });
};

export const register = async (email: string, password: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, you would send this to a backend
      resolve(mockedUser);
    }, 1000);
  });
};

export const forgotPassword = async (email: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, you would send a password reset email
      resolve(true);
    }, 1000);
  });
};


