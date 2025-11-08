"use client";
import axios from "axios";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH;

  const getProfile = async () => {
    try {
      const result = await axios.get(`${baseUrl}/auth/students/profile`, {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      });
      setUserProfile(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/individual/login");
    }
    getProfile();
  }, []);

  return (
    <div>
      <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-center gap-8 space-y-4 px-4 pb-8 pt-5 lg:flex-row lg:items-start lg:gap-36 lg:pb-20">
        <Card className="w-full">
          <CardContent className="flex flex-col rounded-md lg:flex-row lg:rounded-none lg:border lg:border-gray-200 lg:px-0">
            <div className="h-auto w-full border-gray-200 lg:w-[18%] lg:border-r lg:py-5">
              <div>
                <CardTitle className="mb-4 flex items-end justify-between gap-4 py-4 lg:mb-8">
                  <div className="flex flex-col">
                    <div className="hidden h-12 w-12 rounded-full bg-gray-700 text-xl font-medium tracking-wide text-white lg:ml-4 lg:grid lg:h-32 lg:w-32 lg:flex-row lg:place-items-center lg:items-center lg:text-3xl lg:font-extrabold">
                      {userProfile?.name
                        .split(" ")[0]
                        ?.slice(0, 1)
                        .toUpperCase() || ""}
                      {userProfile?.name.split(" ")[1] === "undefined"
                        ? " "
                        : userProfile?.name
                            .split(" ")[1]
                            ?.slice(0, 1)
                            .toUpperCase()}
                    </div>
                    <div className="mx-2 hidden text-wrap text-center text-base font-bold tracking-normal lg:block lg:text-lg">
                      {userProfile.name}
                    </div>
                  </div>
                  <button
                    className="mb-4 flex space-x-2 rounded bg-gray-700 p-2 text-white lg:hidden"
                    onClick={() => setMenuOpen(!menuOpen)}
                  >
                    <MenuIcon className="text-lg" />
                  </button>
                </CardTitle>
              </div>
              <ul
                className={`flex-col space-y-2 lg:visible lg:flex lg:space-y-0 ${
                  menuOpen ? "flex" : "hidden lg:flex"
                }`}
              >
                <li className="pb-2 text-sm font-medium lg:text-base">
                  <Link
                    onClick={() => setMenuOpen(!menuOpen)}
                    href="profile"
                    className={`bg-transparent text-gray-900 ${
                      pathname.includes("profile")
                        ? "text-black underline underline-offset-4"
                        : ""
                    } block rounded-md p-2 transition duration-200 hover:bg-gray-500 hover:text-white`}
                  >
                    Profile
                  </Link>
                </li>
                <li className="pb-2 text-sm font-medium lg:text-base">
                  <Link
                    onClick={() => setMenuOpen(!menuOpen)}
                    href="account-security"
                    className={`bg-transparent text-gray-900 ${
                      pathname.includes("account-security")
                        ? "text-black underline underline-offset-4"
                        : ""
                    } duration-800 block rounded-md p-2 transition hover:bg-gray-800 hover:text-white`}
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
    </div>
  );
}
