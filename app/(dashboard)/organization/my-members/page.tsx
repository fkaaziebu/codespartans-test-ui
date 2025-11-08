"use cliemt";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2Icon } from "lucide-react";
import Link from "next/link";
type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  email: string;
  progress: number;
};

const defaultData: Person[] = [
  {
    firstName: "tanner",
    lastName: "linsley",
    age: 24,
    visits: 100,
    email: "delaliagbesidorwu@gmail.com",
    progress: 50,
  },
  {
    firstName: "tandy",
    lastName: "miller",
    age: 40,
    visits: 40,
    email: "delaliagbesidorwu@gmail.com",
    progress: 80,
  },
  {
    firstName: "joe",
    lastName: "dirte",
    age: 45,
    visits: 20,
    email: "delaliagbesidorwu@gmail.com",
    progress: 10,
  },
];

export default function Members() {
  return (
    <div className="mx-auto max-w-screen-xl flex  items-center gap-36">
      <div className="mt-20 border rounded-none">
        <Table>
          <TableHeader className="text-nowrap">
            <TableRow>
              <TableHead className=" font-bold text-2xl">
                Membership summary
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableHeader>
            <TableRow className="bg-gray-200 hover:bg-gray-200">
              <TableHead className="bg-gray-200">
                <Checkbox className="mr-4" />
              </TableHead>
              <TableHead className="-w-[100%] text-black ">
                Email addess
              </TableHead>
              <TableHead className="w-[100%] text-black">FirstName</TableHead>
              <TableHead className=" w-[100%] text-black">LastName</TableHead>
              <TableHead className="w-[100%] text-black">Age</TableHead>
              <TableHead className="w-[100%]  text-black">Status</TableHead>
              <TableHead>
                <Link href="#">
                  <Trash2Icon className="text-black" />
                </Link>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {defaultData.map((person) => (
              <TableRow key={person.email}>
                <TableCell>
                  <Checkbox className="mr-4" />
                </TableCell>
                <TableCell>{person.email}</TableCell>
                <TableCell>{person.firstName}</TableCell>
                <TableCell>{person.lastName}</TableCell>
                <TableCell>{person.age}</TableCell>
                <TableCell>{person.progress}</TableCell>
                <TableCell>
                  <span className="text-sm font-light">❌</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
