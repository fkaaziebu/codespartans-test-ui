// import { Card, CardContent, CardTitle } from "@/components/ui/card";
// import LearningMode from "./learning-mode";
// import ProctoredMode from "./proctored-mode";
// import axios from "axios";

// interface QuizComponentProps {
//   mode: "proctored" | "learning";
// }

// const QuizComponent: React.FC<QuizComponentProps> = ({ mode }) => {
//   const subscribedCoursesDetails = async () => {
//     try {
//       const result = await axios.get(
//         `${baseUrl}/simulation/courses/${courseId}`,
//         {
//           headers: {
//             Authorization: "Bearer " + sessionStorage.getItem("token"),
//           },
//         }
//       );
//       console.log(result.data);
//     } catch (error) {
//       console.log(error);
//     } finally {
//     }
//   };

//   return (
//     <Card className="border-none shadow-none ">
//       <CardTitle></CardTitle>
//       <CardContent>
//         {mode === "proctored" ? <ProctoredMode /> : <LearningMode />}
//       </CardContent>
//     </Card>
//   );
// };
// export default QuizComponent;
