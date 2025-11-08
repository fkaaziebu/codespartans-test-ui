"use client";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function SearchPage() {
  return (
    <Suspense fallback={<LoaderCircle />}>
      <ActualSearchPage />
    </Suspense>
  );
}

const ActualSearchPage = () => {
  const searchParams = useSearchParams();
  const [searchedResult, setSearchedResult] = useState<{
    hits: Array<{
      id: number;
      title: string;
      description: string;
      time: number;
      domains: Array<string>;
      current_price: number;
      original_price: number;
      avatar_url: string;
    }>;
    processingTimeMs: number;
    estimatedTotalHits: number;
    facetStats: {
      [key: string]: object;
    };
    facetDistribution: {
      domains: {
        [key: string]: number;
      };
    };
  }>({
    hits: [],
    processingTimeMs: 0,
    estimatedTotalHits: 0,
    facetStats: {},
    facetDistribution: {
      domains: {},
    },
  });
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_INVENTORY;

  const searchCourses = async () => {
    try {
      setIsSearchLoading(true);
      setSearchedResult({
        hits: [],
        processingTimeMs: 0,
        estimatedTotalHits: 0,
        facetStats: {},
        facetDistribution: {
          domains: {},
        },
      });
      const response = await axios.get(
        `${baseUrl}/courses/search?offset=0&limit=10&searchTerm=${searchParams.get("q")}&filter=`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      setSearchedResult(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSearchLoading(false);
    }
  };

  useEffect(() => {
    searchCourses();
  }, [searchParams]);

  return (
    <div>
      {!isSearchLoading ? (
        <>
          <div className="mx-auto max-w-screen-xl py-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                {searchedResult.estimatedTotalHits} results for{" "}
                {searchParams.get("q")}
              </h1>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Filters Section */}
              <div className="col-span-12 flex items-center justify-between">
                <div className="relative inline-block">
                  <select className="border border-gray-900 bg-white px-3 py-2">
                    <option>Most Relevant</option>
                    <option>Most Reviewed</option>
                    <option>Highest Rated</option>
                    <option>Newest</option>
                  </select>
                </div>
                <span className="font-bold text-gray-500">
                  {searchedResult.estimatedTotalHits} results
                </span>
              </div>
              <div className="col-span-3 space-y-6">
                Filters goes here, yet to work on that
              </div>
              {/* <div className="col-span-3 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">Ratings</h2>
                    <button className="text-gray-500">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <input type="radio" className="h-4 w-4 text-blue-600" />
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {Array(5)
                            .fill(null)
                            .map((_, i) => (
                              <svg
                                key={i}
                                className="h-4 w-4"
                                fill={i < rating ? "currentColor" : "none"}
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                />
                              </svg>
                            ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {rating} & up
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Results Section */}
              <div className="col-span-9">
                {searchedResult.hits.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="mb-6 flex rounded-lg border p-4"
                  >
                    <div className="my-auto h-full w-60 flex-shrink-0 bg-blue-100">
                      <Image
                        src={course.avatar_url}
                        height={400}
                        width={400}
                        alt=""
                        className=""
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {course.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {course.description}
                      </p>
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">
                          {Math.floor(course.time / 60)}h {course.time % 60}m •{" "}
                          {course.domains.length} lectures • All Levels
                        </span>
                      </div>
                      {course.current_price && (
                        <div className="mt-2">
                          <span className="text-lg font-bold">
                            ${course.current_price}
                          </span>
                          {course.original_price &&
                            course.original_price !== course.current_price && (
                              <span className="ml-2 text-sm line-through">
                                ${course.original_price}
                              </span>
                            )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center py-5">
          <LoaderCircle className="h-16 w-16 animate-spin text-gray-300" />
        </div>
      )}
    </div>
  );
};
