"use client";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topic } from "@/app/types/topic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import Thumbnail from "@/public/images/mathematics thumbnail.jpeg";

const CartPage = ({ topic: initialTopics = [] }) => {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(sessionStorage.getItem("token"));
  }, []);

  const getCart = async () => {
    try {
      setLoading(true);
      const result = await axios.get(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/carts`,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );
      console.log(result.data);
      setTopics(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getCart();
    }
  }, [token]);

  const calculateTotal = () => {
    return topics.reduce((sum, topic) => sum + topic.current_price, 0);
  };

  const calculateOriginalTotal = () => {
    return topics.reduce((sum, topic) => sum + topic.original_price, 0);
  };

  const calculateDiscount = () => {
    const originalTotal = calculateOriginalTotal();
    const currentTotal = calculateTotal();
    return Math.round(((originalTotal - currentTotal) / originalTotal) * 100);
  };

  const removeTopic = async (courseId: string) => {
    try {
      await axios.patch(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/carts/${courseId}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const removeCourse = (courseId: string) => {
    setTopics(topics.filter((topic) => topic.id !== courseId));
    removeTopic(courseId);
  };

  if (!topics || topics.length === 0) {
    return (
      <div className=" mx-auto p-6">
        <div className="text-center py-16">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">
            Looks like you haven&apos;t added any courses yet.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Link href="/individual/home">Browse Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <p className="text-gray-600 mb-6">{topics.length} Topics in Cart</p>

          <div className="space-y-6">
            {topics.map((topic) => (
              <Card key={topic.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Image
                      src={Thumbnail}
                      alt={topic.title}
                      className="w-48 h-28 object-cover rounded"
                    />

                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {topic.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                            <span>{topic.time} total hours</span>
                            <span>•</span>
                            <span>{topic.level}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            ${topic.current_price}
                          </div>
                          <div className="text-sm text-gray-500 line-through">
                            ${topic.original_price}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-4">
                        {topic.isBestseller && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800"
                          >
                            Bestseller
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-4 mt-4">
                        <Button
                          disabled={loading}
                          onClick={() => removeCourse(topic.id)}
                          className={cn(
                            "w-full rounded-none py-6 bg-purple-600 hover:bg-purple-700 font-bold",
                            loading && "bg-purple-400 hover:bg-purple-500"
                          )}
                        >
                          {loading ? "Loading..." : "Remove"}
                        </Button>
                        <Button
                          disabled={loading}
                          className={cn(
                            "w-full rounded-none py-6 bg-purple-600 hover:bg-purple-700 font-bold",
                            loading && "bg-purple-400 hover:bg-purple-500"
                          )}
                        >
                          {loading ? "Loading..." : "Save for later"}
                        </Button>
                        <Button
                          disabled={loading}
                          className={cn(
                            "w-full rounded-none py-6 bg-purple-600 hover:bg-purple-700 font-bold",
                            loading && "bg-purple-400 hover:bg-purple-500"
                          )}
                        >
                          {loading ? "Loading..." : "Move to wishlist"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Total:</h2>
              <div className="text-3xl font-bold mb-2">${calculateTotal()}</div>
              <div className="text-gray-500 line-through mb-1">
                ${calculateOriginalTotal()}
              </div>
              <div className="text-gray-600 mb-6">
                {calculateDiscount()}% off
              </div>

              <Link
                href="/individual/checkout "
                className={cn(
                  "w-full flex items-center text-white justify-center rounded-none py-4 bg-purple-600 hover:bg-purple-700 font-bold",
                  loading && "bg-purple-400 hover:bg-purple-500"
                )}
              >
                {loading ? "Loading..." : "Checkout"}
              </Link>

              <div className="mb-4 mt-4">
                <h3 className="font-semibold mb-2">Promotions</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-grow p-2 border rounded"
                  />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
