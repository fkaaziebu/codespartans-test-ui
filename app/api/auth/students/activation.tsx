import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH;

export const activateAccount = async (
  activationCode: string,
  email: string,
): Promise<unknown> => {
  try {
    const response = await axios.patch(
      `${baseUrl}/auth/students/activate?activationCode=${activationCode}`,
      {
        email,
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
