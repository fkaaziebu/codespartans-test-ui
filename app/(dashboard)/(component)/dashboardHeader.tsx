"use client";
import Link from "next/link";
import { BellAlertIcon } from "@heroicons/react/16/solid";
import {
  HeartIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/16/solid";

import { Slide, toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../../components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { SearchIcon } from "lucide-react";
import MyLearningDropdown from "./myLearning";

export default function UserNavbar() {
  const [userProfile, setUserProfile] = useState({
    name: "",
    role: "",
    email: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<
    Array<{ id: number; title: string }>
  >([]);
  const [focus, setFocus] = useState(false);

  const router = useRouter();

  const getProfile = async () => {
    try {
      const result = await axios.get(
        "https://exam-simulation-platform-production-307d.up.railway.app/v1/students/profile",
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );
      console.log(result);
      setUserProfile(result.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch profile", {
        position: "bottom-right",
        autoClose: 3000,
        transition: Slide,
      });
    }
  };

  const search = async () => {
    try {
      const result = await axios.get(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/courses/search?offset=0&limit=10&searchTerm=${searchTerm}`,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );
      console.log("searchresult", result);
      setSearchResult(result.data);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };
  useEffect(() => {
    search();
  }, [searchTerm]);

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/organization/login");
    } else {
      getProfile();
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    router.push("/individual/login");
    toast.success("Logout successful", {
      position: "bottom-right",
      autoClose: 1000,
      transition: Slide,
    });
  };

  return (
    <nav className="flex w-full justify-between items-center p-4 bg-white shadow-md">
      <div className="flex items-center space-x-4">
        <div className="text-sm lg:text-3xl font-bold">
          <Link href="home">
            <span className="text-purple-600 ">ExamSim</span>
          </Link>
        </div>
        <div className="hidden lg:flex items-center space-x-4">
          <Link href="#">
            <span>Categories</span>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="flex-grow mx-8 sm:mx-4">
        <div className="relative">
          <MagnifyingGlassIcon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5"
            aria-label="Search"
          />
          <input
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setFocus(true)}
            type="text"
            name="query"
            placeholder="Search..."
            className="w-full pl-10 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300 hidden md:block"
          />
        </div>
        {focus && (
          <div className="relative">
            <div className="absolute w-full bg-white shadow-lg rounded-b-md mt-1 z-10">
              <ul className="py-2">
                {searchResult.map((term) => (
                  <Link
                    href={`search?searchTerm=${term.title}`}
                    key={term.id}
                    className="flex px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setFocus(false)}
                  >
                    <SearchIcon className="mr-2" />
                    {term.title}
                  </Link>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <Link href="#" className="text-sm hidden lg:block">
          ExamSim Business
        </Link>
        <Link href="#" className="text-sm hidden lg:block">
          Teach on ExamSim
        </Link>
        <span className="hidden lg:block">{<MyLearningDropdown />}</span>

        <button className="text-sm" aria-label="Favorites">
          <HeartIcon width={24} height={24} />
        </button>
        <button className="text-sm " aria-label="Shopping Cart">
          <ShoppingCartIcon width={24} height={24} />
        </button>
        <button className="text-sm " aria-label="Notifications">
          <BellAlertIcon width={24} height={24} />
        </button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 bg-gray-800 rounded-full text-white flex items-center justify-center">
              {userProfile.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full mt-2">
            <DropdownMenuLabel>
              <div className="flex items-center space-x-2 w-full">
                <button className="w-10 h-10 bg-gray-800 rounded-full text-white flex items-center justify-center">
                  {userProfile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </button>
                <div>
                  <h2 className="font-bold text-gray-800">
                    {userProfile.name}
                  </h2>
                  <p className="text-gray-400 text-xs">{userProfile.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link href="my-learning">My learning</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="cart">My Cart</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Link href="/component/invite-members">Invite Members</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/organization/my-members">My Members</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Notifications</DropdownMenuItem>
              <DropdownMenuItem>Messages</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link href="/user-settings/profile">Account Settings</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
