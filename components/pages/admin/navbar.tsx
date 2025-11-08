// components/Navbar.tsx
import React from "react";
import { BellIcon, UserCircleIcon, SunIcon } from "lucide-react";

interface NavbarProps {
  userRole: "instructor" | "admin";
  onToggleRole: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userRole, onToggleRole }) => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-gray-800">
              Code Spartans
            </span>
            <div className="ml-10 flex space-x-4">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {userRole === "instructor" ? "Instructor" : "Admin"}
              </span>
              {/* Toggle role button for demo purposes */}
              <button
                onClick={onToggleRole}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-200"
              >
                Switch to {userRole === "instructor" ? "Admin" : "Instructor"}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <SunIcon size={20} />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <BellIcon size={20} />
            </button>
            <div className="relative">
              <button className="flex items-center text-gray-500 hover:text-gray-700">
                <UserCircleIcon size={32} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
