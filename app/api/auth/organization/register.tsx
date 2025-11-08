import axios from "axios";

// const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseUrl = "http://localhost:3007/v1";

interface UserData {
  organizationName: string;
  organizationLocation: string;
  adminName: string;
  adminEmail: string;
  password: string;
  organizationLogo: string;
}

export const registerOrganization = async (userData: UserData) => {
  try {
    const response = await axios.post(
      `${baseUrl}/auth/students/register`,
      userData,
    );
    return response.data;
  } catch (error) {
    //@ts-expect-error nec
    if (error.response && error.response.data && error.response.data.message) {
      //@ts-expect-error nec
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Registration failed. Please try again.");
    }
  }
};
