import axios from "axios";

// const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseUrl = "http://localhost:3007/v1";

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${baseUrl}/auth/students/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    //@ts-expect-error nec
    if (error.response && error.response.data && error.response.data.message) {
      //@ts-expect-error nec
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Login failed. Please try again.");
    }
  }
};
