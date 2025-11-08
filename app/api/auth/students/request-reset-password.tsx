import axios from "axios";

// const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseUrl = "http://localhost:3007/v1";

export const requestResetPassword = async (email: string) => {
  try {
    const response = await axios.post(
      `${baseUrl}/auth/students/request-password-reset`,
      {
        email,
      },
    );
    return response.data;
  } catch (error) {
    // @ts-expect-error nec
    throw error.response
      ? // @ts-expect-error nec
        error.response.data
      : new Error("Reset password failed");
  }
};
