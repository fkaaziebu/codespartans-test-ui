"use client";
import { Clock, Star } from "lucide-react";
import Image from "next/image";
import { Topic } from "@/app/types/topic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/app/api/topics";
import { Slide, toast } from "react-toastify";
import { useState } from "react";
import Thumbnail from "@/public/images/mathematics thumbnail.jpeg";
interface TopicCardProps {
  topic: Topic;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const handleclick = () => {
    router.push(`/individual/topic-details/${topic.id}`);
  };

  async function handleAddToCart() {
    const courseId = topic.id.toString();
    if (!courseId) {
      setErrorMessage("You need the course id");
      return;
    }

    try {
      await addToCart(courseId);
      toast.success("Course added to cart successfully", {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
      router.push("/individual/cart");
    } catch (error) {
      // @ts-expect-error very necessary
      setErrorMessage(error.message);
    } finally {
    }
  }

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-200 overflow-hidden md:overflow-visible">
      <div onClick={handleclick}>
        <div className="flex flex-col h-full pointer-events-none">
          {/* Thumbnail */}
          <div className="relative aspect-video">
            <Image
              src={Thumbnail}
              alt={topic.title}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
            />
          </div>

          {/* Topic Info */}
          <div className="p-4">
            <h3 className="font-bold text-base mb-1 line-clamp-2">
              {topic.title}
            </h3>
            <p className="text-sm text-gray-600 mb-1">{topic?.instructor}</p>

            <div className="flex items-center text-sm mb-1">
              <span className="text-orange-400 font-bold mr-1">
                {topic?.rating}
              </span>
              <div className="flex mr-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(topic?.rating)
                        ? "text-orange-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                  />
                ))}
              </div>
              <span className="text-gray-600">
                ({topic?.reviewsCount?.toLocaleString()})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold">
                ${topic.current_price.toFixed(2)}
              </span>
              {topic.original_price && (
                <span className="text-gray-600 line-through">
                  ${topic.original_price.toFixed(2)}
                </span>
              )}
            </div>

            {topic?.isBestseller && (
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded mt-2">
                Bestseller
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover Card */}
      <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute left-full  top-0 ml-2 z-10 w-72 md:w-80 bg-white shadow-xl rounded-lg p-4 transition-all duration-200 overflow-hidden pointer-events-auto">
        <h3 className="font-bold text-lg mb-1">{topic.title}</h3>
        <p className="text-sm text-gray-800 font-medium mb-2">
          {topic?.updatedDate && `Updated ${topic?.updatedDate}`}
        </p>
        <div className="flex items-center text-xs text-gray-600 mb-1">
          <Clock className="w-4 h-4 mr-1" />
          <span>{topic.time} total ·</span>
          <span className="ml-1">{topic?.level}</span>
        </div>
        <p className="text-xs text-gray-600 mb-3">{topic.description}</p>
        <ul className="text-xs text-gray-600 space-y-1">
          {topic.domains &&
            topic.domains.slice(0, 3).map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">✓</span>
                {point}
              </li>
            ))}
        </ul>
        {errorMessage && (
          <div className="px-4 py-2 bg-red-50 text-red-800 rounded-full text-sm">
            {errorMessage}
          </div>
        )}

        <Button
          onClick={handleAddToCart}
          className="border rounded-none p-2 bg-purple-400 hover:bg-purple-500 font-bold w-full mt-2"
        >
          Add to cart
        </Button>
      </div>
    </div>
  );
};

export default TopicCard;
