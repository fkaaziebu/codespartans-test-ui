"use client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MenuIcon } from "lucide-react";
export default function AccountSettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "",
    role: "",
    email: "",
  });

  const router = useRouter();
  const pathname = usePathname();

  const getProfile = async () => {
    try {
      const result = await axios.get(
        "https://exam-simulation-platform-production-307d.up.railway.app/v1/user/profile",
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );
      setUserProfile(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/organization/login");
    }
    getProfile();
  }, []);

  return (
    <div className="mx-auto max-w-screen-xl flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-36 justify-center pb-8 lg:pb-20 pt-5 px-4">
      <Card className="w-full">
        <CardContent className="flex flex-col lg:flex-row lg:border lg:border-gray-200 rounded-md lg:rounded-none lg:px-0">
          <div className="w-full lg:w-[15%] lg:border-r border-gray-200 lg:py-5 h-auto">
            <div>
              <CardTitle className="flex justify-between items-end gap-4 mb-4 lg:mb-8 py-4">
                <div className=" flex flex-col">
                  <div className="hidden lg:grid lg:flex-row w-12 h-12 lg:w-32 lg:h-32 bg-gray-700 rounded-full text-xl lg:text-3xl lg:items-center lg:ml-4 lg:place-items-center font-medium lg:font-extrabold tracking-wide text-white">
                    {userProfile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="font-bold hidden lg:block text-base lg:text-lg tracking-normal text-center">
                    {userProfile.name}
                  </div>
                </div>
                <button
                  className="lg:hidden mb-4 flex space-x-2 text-white bg-gray-700 p-2 rounded "
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <MenuIcon className="text-lg" />
                </button>
              </CardTitle>
            </div>
            <ul
              className={`flex-col space-y-2 lg:space-y-0 lg:flex lg:visible ${
                menuOpen ? "flex" : "hidden lg:flex"
              }`}
            >
              <li className="pb-2 text-sm lg:text-base font-medium">
                <Link
                  onClick={() => setMenuOpen(!menuOpen)}
                  href="/user-settings/profile"
                  className={`text-gray-900 bg-transparent ${
                    pathname === "/user-settings/profile"
                      ? "bg-purple-500 text-white"
                      : ""
                  } hover:text-white hover:bg-gray-500 p-2 rounded-md block transition duration-200`}
                >
                  Profile
                </Link>
              </li>
              <li className="pb-2 text-sm lg:text-base font-medium">
                <Link
                  onClick={() => setMenuOpen(!menuOpen)}
                  href="/user-settings/account-security"
                  className={`text-gray-900 bg-transparent ${
                    pathname.includes("/user-settings/account-security")
                      ? "bg-purple-500 text-white"
                      : ""
                  } hover:text-white hover:bg-gray-800 p-2 rounded-md block transition duration-800`}
                >
                  Account Security
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full lg:w-full">{children}</div>
        </CardContent>
      </Card>
    </div>
  );
}
