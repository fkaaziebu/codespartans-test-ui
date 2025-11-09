"use client";
import axios from "axios";
import {
  BookOpen,
  Clock,
  CreditCard,
  History,
  LoaderCircle,
  LogOut,
  Search,
  Settings,
  ShoppingCart,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAction } from "@/hooks/use-action-store";
import mathematics_image from "@/public/images/mathematics thumbnail.jpeg";

type LearningItem = {
  id: number;
  title?: string;
  name?: string;
  avatar_url: string;
};

function SearchParamsHandler({
  onSearchParamsChange,
}: {
  onSearchParamsChange: (query: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("q")) {
      onSearchParamsChange(searchParams.get("q") || "");
    }
  }, [searchParams, onSearchParamsChange]);

  return null;
}

export default function TestSuiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { type, data } = useAction();
  const [isLoading, setIsLoading] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [myLearning, setMyLearning] = useState<LearningItem[]>([]);
  const previousLearningRef = useRef<Array<LearningItem>>([]);
  const [profile, setProfile] = useState<{
    id: number;
    name: string;
    email: string;
  }>();
  const [cartItems, setCartItems] = useState<
    Array<{
      id: number;
      title: string;
      currency: string;
      original_price: number;
      current_price: number;
      avatar_url: string;
    }>
  >([]);
  const previousCartRef = useRef<
    Array<{
      id: number;
      title: string;
      currency: string;
      original_price: number;
      current_price: number;
      avatar_url: string;
    }>
  >([]);

  const [state, setState] = useState(1);
  const [isOpenBanner, setIsOpenBanner] = useState(true);
  const [hasActiveTest, setHasActiveTest] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [suiteId, setSuiteId] = useState("");
  const [attemptId, setAttemptId] = useState("");
  const [totalQuestions, setTotalQuestions] = useState();
  const [courseId, setCourseId] = useState();
  const [mode, setMode] = useState<"proctored" | "learning">();
  const [testId, setTestId] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedResult, setSearchedResult] = useState<{
    hits: Array<{
      id: number;
      title: string;
      avatar_url: string;
    }>;
    facetDistribution: {
      domains: {
        [key: string]: number;
      };
    };
  }>({
    hits: [],
    facetDistribution: {
      domains: {},
    },
  });
  const [searchHasResultsAndActive, setSearchHasResultsAndActive] =
    useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT = 5000;

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      setHasActiveTest(false);
    }, INACTIVITY_TIMEOUT);
  }, []);

  // const searchParams = useSearchParams();
  const initializeSocket = useCallback(() => {
    const socket = io(
      "http://ec2-3-66-190-132.eu-central-1.compute.amazonaws.com:3002",
      {
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      },
    );

    socket.on("connect", () => {
      const userId = sessionStorage.getItem("userId");
      // Join test room if testId is provided
      if (userId) {
        socket.emit(
          "registerUser",
          { user_id: userId },
          (response: {
            status: string;
            user_id: number;
            socketCount: number;
          }) => {
            console.log("Joined test room:", response);
          },
        );
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      setHasActiveTest(false);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    socket.on("activeTestsUpdate", (data) => {
      resetInactivityTimer();

      if (data.activeTests[0].time_remaining > 0) {
        setHasActiveTest(true);
      }

      if (data.activeTests[0].time_remaining <= 0) {
        setHasActiveTest(false);
      }

      setState(data.activeTests[0].status);
      setTimeRemaining(data.activeTests[0].time_remaining);
      setCourseTitle(data.activeTests[0].course_title);
      setCourseId(data.activeTests[0].course_id);
      setTestId(data.activeTests[0].test_id);
      setSuiteId(data.activeTests[0].suite_id);
      setAttemptId(data.activeTests[0].attempt_id);
      setMode(data.activeTests[0].mode);
      setTotalQuestions(data.activeTests[0].total_questions);
    });

    return socket;
  }, [resetInactivityTimer]);

  const handleSearchParamsChange = useCallback((query: string) => {
    setSearchTerm(query);
  }, []);

  const router = useRouter();
  const pathname = usePathname();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_INVENTORY;

  const getSubscribedCourses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseUrl}/users/courses`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      return response.data;
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubscribedCategories = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseUrl}/users/categories`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      return response.data.categories;
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLearningData = async () => {
    if (!sessionStorage.getItem("token")) return;

    const [courses, categories] = await Promise.all([
      getSubscribedCourses(),
      getSubscribedCategories(),
    ]);

    const mergedData = [...courses, ...categories];
    const uniqueData = Array.from(
      new Map(mergedData.map((item) => [item.id, item])).values(),
    );

    if (
      JSON.stringify(uniqueData) !== JSON.stringify(previousLearningRef.current)
    ) {
      setMyLearning(uniqueData);
      previousLearningRef.current = uniqueData;
    }
  };

  const getCartItems = async () => {
    try {
      setIsCartLoading(true);

      const response = await axios.get(`${baseUrl}/carts`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      const cartData = response.data;

      if (
        JSON.stringify(cartData) !== JSON.stringify(previousCartRef.current)
      ) {
        setCartItems(cartData);
        previousCartRef.current = cartData;
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsCartLoading(false);
    }
  };

  const getUserProfile = async () => {
    try {
      const response = await axios.get(`${baseUrl}/auth/students/profile`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      setProfile(response.data);
      sessionStorage.setItem("userId", response.data.id);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const searchCourses = async () => {
    try {
      setIsSearchLoading(true);
      setSearchedResult({
        hits: [],
        facetDistribution: {
          domains: {},
        },
      });
      const response = await axios.get(
        `${baseUrl}/courses/search?offset=0&limit=10&searchTerm=${searchTerm}&filter=`,
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

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  const formatTime = (
    seconds: number,
    format: "HH:MM:SS" | "MM:SS" = "HH:MM:SS",
  ): string => {
    if (format === "MM:SS") {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    searchCourses();
  }, [searchTerm]);

  useEffect(() => {
    if (type === "cart-action") {
      setCartItems(data.cartItems);
    }

    if (type === "subscribe-action") {
      setMyLearning(data.subscribedCourseItems);
    }
  }, [type, data]);

  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    updateLearningData();
    getCartItems();
  }, [pathname]);

  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      setHasToken(true);
    } else {
      router.push("/individual/login");
    }

    // Test time update
    const socket = initializeSocket();
    socket.on("activeTestsUpdate", (data) => {
      if (data.activeTests[0].time_remaining > 0) {
        setHasActiveTest(true);
      }

      if (data.activeTests[0].time_remaining <= 0) {
        setHasActiveTest(false);
      }

      setState(data.activeTests[0].status);
      setTimeRemaining(data.activeTests[0].time_remaining);
      setCourseTitle(data.activeTests[0].course_title);
      setCourseId(data.activeTests[0].course_id);
      setTestId(data.activeTests[0].test_id);
      setSuiteId(data.activeTests[0].suite_id);
      setAttemptId(data.activeTests[0].attempt_id);
      setMode(data.activeTests[0].mode);
      setTotalQuestions(data.activeTests[0].total_questions);
    });

    getUserProfile();
  }, []);

  return (
    <div
      className="flex h-full flex-col"
      onClick={() => setSearchHasResultsAndActive(false)}
    >
      <Suspense fallback={null}>
        <SearchParamsHandler onSearchParamsChange={handleSearchParamsChange} />
      </Suspense>
      {hasActiveTest && isOpenBanner && (
        <div className="flex w-full items-center justify-between bg-yellow-500 px-2 py-2 text-yellow-950 sm:px-4">
          <Link
            href={`/tests/${courseId}/suites/${suiteId}/attempts/${attemptId}?mode=${mode}&testId=${testId}&totalQuestions=${totalQuestions}`}
            className="underline"
          >
            Test for {courseTitle} in progress, click to continue
          </Link>

          <div className="flex items-center gap-2">
            {mode && mode === "proctored" && (
              <>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">
                  {formatTime(timeRemaining)}
                </span>
              </>
            )}
            {state === 3 && <span>Paused</span>}
            <Button
              onClick={() => setIsOpenBanner(false)}
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-yellow-500 hover:text-yellow-950 sm:h-7 sm:w-7"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      )}

      <nav
        className="flex items-center justify-between bg-white px-3 py-3 shadow-lg sm:px-6 sm:py-4 lg:px-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center gap-3 sm:gap-8">
          <Link
            href="/"
            className="whitespace-nowrap text-lg font-semibold text-purple-600 sm:text-xl"
          >
            ExamSim
          </Link>
          {/* Desktop Search */}
          <div className="relative hidden w-full items-center rounded-3xl border border-gray-900 pl-3 sm:flex lg:mr-5">
            {isSearchLoading ? (
              <LoaderCircle className="ml-2 h-5 w-5 animate-spin text-gray-300" />
            ) : (
              <Search className="ml-2 h-5 w-5 text-gray-300" />
            )}
            <Input
              className="rounded-3xl border-0 px-6 py-5 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Search for anything"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchHasResultsAndActive(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router.push(`/search?q=${searchTerm}`);
                  setSearchHasResultsAndActive(false);
                }
              }}
            />
            {searchHasResultsAndActive && searchedResult.hits.length > 0 && (
              <div className="absolute left-0 top-12 z-30 flex w-full flex-col overflow-hidden rounded-md border bg-white shadow-lg">
                {searchedResult?.hits?.length > 0 ? (
                  <div className="flex w-full flex-col">
                    {Object.keys(searchedResult.facetDistribution.domains).map(
                      (domain, index) => {
                        if (index <= 5) {
                          return (
                            <Link
                              key={domain}
                              className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-100"
                              href={`/search?q=${domain}`}
                              onClick={() =>
                                setSearchHasResultsAndActive(false)
                              }
                            >
                              <Search className="h-4 w-4 text-gray-600" />
                              <div className="text-sm">{domain}</div>
                            </Link>
                          );
                        }
                      },
                    )}
                    {searchedResult?.hits.map((course, index) => {
                      if (index <= 5) {
                        return (
                          <Link
                            key={course.id}
                            className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-100"
                            href={`/courses/${course.id}`}
                            onClick={() => setSearchHasResultsAndActive(false)}
                          >
                            <Image
                              src={course.avatar_url}
                              height="400"
                              width="400"
                              alt="Course avatar"
                              className="h-6 w-7 rounded-sm bg-muted object-cover"
                            />
                            <div className="text-sm">{course.title}</div>
                          </Link>
                        );
                      }
                    })}
                  </div>
                ) : (
                  <div className="flex w-full items-center justify-center py-2 text-sm">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* mobile search */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <Search className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="w-full p-0">
              <div className="p-4">
                <div className="relative flex w-full items-center">
                  <Input
                    className="pr-10"
                    placeholder="Search for anything"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  {isSearchLoading ? (
                    <LoaderCircle className="absolute right-3 h-5 w-5 animate-spin text-gray-300" />
                  ) : (
                    <Search className="absolute right-3 h-5 w-5 text-gray-300" />
                  )}
                </div>
                <div className="mt-2">
                  {searchedResult?.hits?.length > 0 && (
                    <div className="flex w-full flex-col">
                      {Object.keys(
                        searchedResult.facetDistribution.domains,
                      ).map((domain, index) => {
                        if (index <= 5) {
                          return (
                            <Link
                              key={domain}
                              className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-100"
                              href={`/search?q=${domain}`}
                              onClick={() =>
                                setSearchHasResultsAndActive(false)
                              }
                            >
                              <Search className="h-4 w-4 text-gray-600" />
                              <div className="text-sm">{domain}</div>
                            </Link>
                          );
                        }
                      })}

                      {searchedResult?.hits.map((course, index) => {
                        if (index <= 5) {
                          return (
                            <Link
                              key={course.id}
                              className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-100"
                              href={`/courses/${course.id}`}
                              onClick={() =>
                                setSearchHasResultsAndActive(false)
                              }
                            >
                              <Image
                                src={course.avatar_url}
                                height={400}
                                width={400}
                                alt="course avatar"
                                className="h-6 w-7 rounded-sm bg-muted object-cover"
                              />
                              <div className="text-sm">{course.title}</div>
                            </Link>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        {!hasToken ? (
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="outline" className="px-2 text-sm sm:px-4">
              Login
            </Button>
            <Button variant="default" className="px-2 text-sm sm:px-4">
              Sign up
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            <HoverCard openDelay={200} closeDelay={200}>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden px-0 hover:bg-white hover:text-violet-500 sm:flex"
                  onClick={() => router.push("/learning")}
                >
                  My learning
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-[280px] sm:w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">My Learning</h4>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => router.push("/learning")}
                    >
                      View all
                    </Button>
                  </div>
                  <ScrollArea className="h-[300px]">
                    {!isLoading ? (
                      myLearning.length > 0 ? (
                        <div className="space-y-4">
                          {myLearning.map((course) => (
                            <Link
                              href={`/tests/${course.id}/suites`}
                              key={course.id}
                              className="flex gap-3"
                            >
                              <Image
                                src={course.avatar_url || mathematics_image}
                                height={400}
                                width={400}
                                alt="course avatar"
                                className="max-h-16 max-w-20 rounded-sm bg-muted object-cover"
                              />
                              <div className="mt-2 space-y-1">
                                <p className="truncate text-wrap text-sm font-medium leading-none">
                                  {course.title || course.name}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          No courses yet
                        </p>
                      )
                    ) : (
                      <div className="py-8 text-center text-sm">Loading...</div>
                    )}
                  </ScrollArea>
                </div>
              </HoverCardContent>
            </HoverCard>

            <HoverCard openDelay={200} closeDelay={200}>
              <HoverCardTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="hover:bg-white hover:text-violet-500"
                  onClick={() => router.push(`/cart`)}
                >
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-[280px] sm:w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Shopping Cart</h4>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => router.push(`/cart`)}
                    >
                      View cart
                    </Button>
                  </div>
                  <ScrollArea className="h-[300px]">
                    {!isCartLoading ? (
                      cartItems.length > 0 ? (
                        <div className="space-y-4">
                          {cartItems.map((item) => (
                            <div key={item.id} className="flex gap-3">
                              <Image
                                src={item.avatar_url}
                                height={400}
                                width={400}
                                alt=""
                                className="h-16 w-20 rounded-sm bg-muted object-cover"
                              />
                              <div className="flex flex-col justify-between py-1">
                                <p className="truncate text-sm font-medium leading-none">
                                  {item.title}
                                </p>
                                <p className="text-sm font-bold">
                                  {formatPrice(
                                    item.current_price,
                                    item.currency,
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex items-center justify-between px-2">
                            <p className="text-sm font-semibold">Total:</p>
                            <p className="text-sm font-bold">
                              {formatPrice(
                                cartItems.reduce(
                                  (acc, item) => acc + item.current_price,
                                  0,
                                ),
                                cartItems[0]?.currency,
                              )}
                            </p>
                          </div>
                          <Button
                            className="w-full text-sm"
                            onClick={() => router.push("/cart")}
                          >
                            Checkout
                          </Button>
                        </div>
                      ) : (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          Your cart is empty
                        </p>
                      )
                    ) : (
                      <div className="py-8 text-center text-sm">Loading...</div>
                    )}
                  </ScrollArea>
                </div>
              </HoverCardContent>
            </HoverCard>

            <HoverCard openDelay={200} closeDelay={200}>
              <HoverCardTrigger asChild>
                <Button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 p-0 text-sm font-bold text-white sm:h-9 sm:w-9 sm:text-base">
                  {profile?.name.split(" ")[0]?.slice(0, 1).toUpperCase() || ""}
                  {profile?.name.split(" ")[1] === "undefined"
                    ? " "
                    : profile?.name.split(" ")[1]?.slice(0, 1).toUpperCase()}
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-[240px] sm:w-60" align="end">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm text-white sm:h-10 sm:w-10 sm:text-base">
                      {profile?.name
                        .split(" ")[0]
                        ?.slice(0, 1)
                        .toLocaleUpperCase() || ""}
                      {profile?.name.split(" ")[1] === "undefined"
                        ? " "
                        : profile?.name.split(" ")[1]?.slice(0, 1)}
                    </div>
                    <div className="flex w-[75%] flex-col">
                      <p className="truncate text-xs font-medium sm:text-sm">
                        {profile?.name.split(" ")[0]?.slice(0, 1).toUpperCase()}
                        {profile?.name
                          .split(" ")[0]
                          .toLowerCase()
                          .slice(1)}{" "}
                        {profile?.name.split(" ")[1] === "undefined"
                          ? " "
                          : profile?.name
                              .split(" ")[1]
                              ?.slice(0, 1)
                              .toUpperCase()}
                        {profile?.name.split(" ")[1] === "undefined"
                          ? " "
                          : profile?.name.split(" ")[1]?.toLowerCase().slice(1)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {profile?.email}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-xs sm:text-sm"
                      size="sm"
                      onClick={() => router.push(`/learning`)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" /> My Learning
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-xs sm:text-sm"
                      size="sm"
                      onClick={() => router.push(`/cart`)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" /> My Cart
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-xs sm:text-sm"
                      size="sm"
                      onClick={() => router.push(`/settings/profile`)}
                    >
                      <Settings className="mr-2 h-4 w-4" /> Account Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-xs sm:text-sm"
                      size="sm"
                    >
                      <CreditCard className="mr-2 h-4 w-4" /> Payment Methods
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-xs sm:text-sm"
                      size="sm"
                    >
                      <History className="mr-2 h-4 w-4" /> Payment History
                    </Button>
                    <Separator />
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-xs hover:text-red-500 sm:text-sm"
                      size="sm"
                      onClick={() => {
                        sessionStorage.clear();
                        router.push(`/individual/login`);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        )}
      </nav>
      {pathname === "/" && (
        <div className="w-full shadow-lg">
          <nav className="no-scrollbar flex justify-evenly space-x-6 overflow-x-auto py-4 text-gray-600">
            {[
              "Development",
              "Business",
              "Finance & Accounting",
              "IT & Software",
              "Office Productivity",
              "Personal Development",
              "Design",
              "Marketing",
              "Health & Fitness",
              "Music",
            ].map((category) => (
              <Link
                key={category}
                href="#"
                className="whitespace-nowrap text-sm"
              >
                {category}
              </Link>
            ))}
          </nav>
        </div>
      )}
      {children}
    </div>
  );
}
