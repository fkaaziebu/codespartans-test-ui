import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface QuestionProps {
  title: string;
  image: string;
  summary: string;
  price: number;
  children: ReactNode;
}

const QuestionCard: React.FC<QuestionProps> = ({
  title,
  image,
  summary,
  price,
  children,
}) => {
  return (
    <Card>
      <CardContent>{image}</CardContent>
      <CardContent>
        <CardTitle className="font-bold text-2xl text-gray-700 ">
          {title}
        </CardTitle>
        <div>{summary}</div>
        <div>{price}</div>
      </CardContent>
      <CardFooter>{children}</CardFooter>
    </Card>
  );
};
export default QuestionCard;
