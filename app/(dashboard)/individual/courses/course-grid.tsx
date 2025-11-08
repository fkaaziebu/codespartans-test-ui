"use client";
import axios from "axios";
import TopicCard from "./course";
import { Topic } from "@/app/types/topic";
import { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import { Slide, toast } from "react-toastify";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CourseCarousel = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [metaData, setMetaData] = useState({
    page: 1,
    lastPage: 1,
  });

  // Slider reference
  const sliderRef = useRef<Slider | null>(null);

  // Next Arrow Component
  const NextArrow = () => (
    <div
      className="absolute top-1/2 -right-5 transform -translate-y-1/2 cursor-pointer z-10 bg-gray-600 text-white rounded-full p-2 shadow-md"
      onClick={() => sliderRef.current?.slickNext()}
    >
      <ChevronRight size={24} />
    </div>
  );

  // Prev Arrow Component
  const PrevArrow = () => (
    <div
      className="absolute top-1/2 -left-5 transform -translate-y-1/2 cursor-pointer z-10 bg-gray-600 text-white rounded-full p-2 shadow-md"
      onClick={() => sliderRef.current?.slickPrev()}
    >
      <ChevronLeft size={24} />
    </div>
  );

  // Fetch topics from the API
  const fetchTopics = async (page: number) => {
    if (loading || page > metaData.lastPage) return;

    setLoading(true);
    try {
      const result = await axios.get(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/courses?page=${page}&limit=8`,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );
      if (result.data?.items && result.data?.meta) {
        // Create a Set of existing topic IDs for deduplication
        const existingIds = new Set(topics.map((topic) => topic.id));

        // Filter out duplicates from new items
        const newTopics = result.data.items.filter(
          (topic: { id: string }) => !existingIds.has(topic.id)
        );

        setTopics((prevTopics) => [...prevTopics, ...newTopics]);
        setMetaData(result.data.meta);
      }
    } catch (error) {
      toast.error("Could not fetch topics, refresh the page", {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Slide,
      });
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics(1); // Initial fetch
  }, []);

  // Check if the last slide is reached and fetch more topics if needed
  const handleSlideChange = (currentSlide: number) => {
    const slidesToShow = 2;
    const threshold = topics.length - slidesToShow * 2;

    if (currentSlide >= threshold && !loading) {
      const nextPage = Math.floor(topics.length / 4) + 1;
      fetchTopics(nextPage);
    }
  };

  // Slider settings
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    afterChange: handleSlideChange,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: false,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: false,
        },
      },
    ],
  };

  if (topics.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-48 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
      <Slider ref={sliderRef} {...settings}>
        {topics.map((topic) => (
          <div key={topic?.id} className="px-2">
            <TopicCard topic={topic} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CourseCarousel;
