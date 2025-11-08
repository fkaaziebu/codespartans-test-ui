import axios from "axios";

// const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseUrl = "http://localhost:3006/v1";

export const addToCart = async (courseId: string) => {
  const token = sessionStorage.getItem("token");
  try {
    const response = await axios.post(
      `${baseUrl}/carts/courses:add?`,
      { courseId },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response;
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
