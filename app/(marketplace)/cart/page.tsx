"use client";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useAction } from "@/hooks/use-action-store";

export default function CartPage() {
  const { onUpdate, data } = useAction();
  const [isSubscribingToCourse, setIsSubscribingToCourse] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [isRemovingFromCart, setIsRemovingFromCart] = useState(false);
  const [cartItems, setCartItems] = useState<
    Array<{
      id: number;
      title: string;
      currency: string;
      original_price: number;
      current_price: number;
    }>
  >([]);
  const [currentCourseRemoving, setCurrentCourseRemoving] = useState<number>(0);

  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_INVENTORY;

  const getUserCart = async () => {
    try {
      setIsLoadingCart(true);

      const response = await axios.get(`${baseUrl}/carts`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      setCartItems(response.data);
    } catch (error) {
      toast({
        title: "An error occured while loading cart items",
        // @ts-expect-error known error
        description: error?.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingCart(false);
    }
  };

  const removeFromCart = async (courseId: number) => {
    try {
      setIsRemovingFromCart(true);

      const response = await axios.patch(
        `${baseUrl}/carts/${courseId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      setCartItems(response.data.cart);

      onUpdate("cart-action", {
        cartItems: response?.data?.cart,
        subscribedCourseItems: data.subscribedCourseItems,
      });
      toast({
        title: "Successfully removed from cart",
        description: "Course successfully removed from cart",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "An error occured while removing from cart",
        // @ts-expect-error known error
        description: error?.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setIsRemovingFromCart(false);
    }
  };

  const subscribeToCourse = async () => {
    try {
      setIsSubscribingToCourse(true);
      const response = await axios.post(
        `${baseUrl}/courses/subscribe`,
        {
          courseIds: cartItems.map((item) => item.id),
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      toast({
        title: "You have subscribed to courses",
        description: "You can now check your learning page",
        variant: "default",
      });

      onUpdate("cart-action", {
        cartItems: [],
        subscribedCourseItems: data.subscribedCourseItems,
      });

      onUpdate("subscribe-action", {
        cartItems: [],
        subscribedCourseItems: response.data.subscribedCourses,
      });

      router.push("/learning");
    } catch (error) {
      toast({
        title: "Error subscribing to course",
        // @ts-expect-error known error
        description: error?.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setIsSubscribingToCourse(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.current_price, 0);
  };

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/individual/login");
    }

    getUserCart();
  }, []);

  if (isLoadingCart) {
    return (
      <div className="mx-auto max-w-screen-xl py-6">
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-screen-xl py-6">
        <h1 className="mb-6 text-2xl font-bold">Shopping Cart</h1>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-4 md:col-span-2">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{item.title}</h3>
                        {item.original_price > item.current_price && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(item.original_price, item.currency)}
                          </p>
                        )}
                        <p className="text-lg font-bold">
                          {formatPrice(item.current_price, item.currency)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          removeFromCart(item.id);
                          setCurrentCourseRemoving(item.id);
                        }}
                      >
                        Remove
                        {isRemovingFromCart &&
                          currentCourseRemoving === item.id && (
                            <LoaderCircle className="ml-2 h-4 w-4 animate-spin text-gray-300" />
                          )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Order Summary</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>
                        {formatPrice(
                          calculateTotal(),
                          cartItems[0]?.currency || "USD",
                        )}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>
                        {formatPrice(
                          calculateTotal(),
                          cartItems[0]?.currency || "USD",
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={subscribeToCourse}
                  >
                    Proceed to subscribe to courses
                    {isSubscribingToCourse && (
                      <LoaderCircle className="ml-2 h-4 w-4 animate-spin text-gray-300" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button className="mt-4" onClick={() => router.push("/")}>
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
