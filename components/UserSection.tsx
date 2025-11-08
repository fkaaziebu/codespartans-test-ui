import Link from "next/link";
interface User {
  name: string;
  role: string;
}

interface UserDashboardProps {
  user: User;
}

const UserSection: React.FC<UserDashboardProps> = ({ user }) => {
  return (
    <div>
      <section className="py-6">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-xl text-white">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <h1 className="T text-2xl font-bold">Welcome back, {user.name}</h1>
            <p className="text-sm text-gray-600">
              {user.role}{" "}
              <Link
                href="#"
                className="text-sm font-bold text-purple-600 underline underline-offset-1"
              >
                Edit occupation and interests
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
export default UserSection;
