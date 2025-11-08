import axios from "axios";

// const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseUrl = "http://localhost:3007/v1";

export const changePassword = async (
  previousPassword: string,
  password: string,
  token: string,
) => {
  try {
    const response = await axios.post(
      `${baseUrl}/auth/students/change-password`,
      { previousPassword, password },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
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
