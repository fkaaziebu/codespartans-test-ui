"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Wallet } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { Slide, toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Topic } from "@/app/types/topic";
import Thumbnail from "@/public/images/mathematics thumbnail.jpeg";

const CheckoutPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [couponCode, setCouponCode] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUserId(sessionStorage.getItem("userId"));
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

  const subscribeToTopics = async (courseIds: number[]) => {
    setLoading(true);
    try {
      await axios.post(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/courses/subscribe`,
        { courseIds },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Purchase complete successfully", {
        position: "bottom-right",
        autoClose: 1000,
        theme: "dark",
        transition: Slide,
      });
      router.push("/individual/my-learning");
    } catch (error) {
      toast.error(
        //@ts-expect-error nec
        error.response?.data?.message || "Error completing purchase",
        {
          position: "bottom-right",
          autoClose: 1000,
          theme: "dark",
          transition: Slide,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCart();
  }, [userId]);

  const calculateTotal = () =>
    topics.reduce((sum, topic) => sum + topic.current_price, 0);
  const calculateOriginalTotal = () =>
    topics.reduce((sum, topic) => sum + topic.original_price, 0);
  const calculateDiscount = () => {
    const originalTotal = calculateOriginalTotal();
    const currentTotal = calculateTotal();
    return originalTotal
      ? Math.round(((originalTotal - currentTotal) / originalTotal) * 100)
      : 0;
  };

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center sm:text-left">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter your first name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter your last name" />
                </div>
              </div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
              <Label htmlFor="address">Street Address</Label>
              <Input id="address" placeholder="Enter your address" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Enter your city" />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" placeholder="Enter postal code" />
                </div>
              </div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="Enter your country" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-4"
              >
                <div className="flex items-center space-x-4 border rounded-lg p-4">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label
                    htmlFor="credit-card"
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-5 w-5" />
                    Credit or Debit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-4 border rounded-lg p-4">
                  <RadioGroupItem value="digital-wallet" id="digital-wallet" />
                  <Label
                    htmlFor="digital-wallet"
                    className="flex items-center gap-2"
                  >
                    <Wallet className="h-5 w-5" />
                    Digital Wallet
                  </Label>
                </div>
              </RadioGroup>
              {paymentMethod === "credit-card" && (
                <div className="mt-4 space-y-4">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input id="expiryDate" placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topics.map((topic) => (
                  <div key={topic.id} className="flex gap-4">
                    <Image
                      src={Thumbnail}
                      alt={topic.title}
                      className="w-20 h-14 object-cover rounded"
                      width={80}
                      height={56}
                    />
                    <div className="flex-grow">
                      <h3 className="font-medium text-sm">{topic.title}</h3>
                      {/* <p className="text-sm text-gray-500">By {topic.author}</p> */}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ${topic.current_price}
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        ${topic.original_price}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>${calculateOriginalTotal()}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Discount:</span>
                    <span>{calculateDiscount()}% OFF</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button variant="outline">Apply</Button>
                  </div>
                </div>

                <Button
                  disabled={loading}
                  onClick={() =>
                    subscribeToTopics(topics.map((topic) => Number(topic.id)))
                  }
                  className={cn(
                    "w-full rounded-none py-6 font-bold",
                    loading
                      ? "bg-purple-400"
                      : "bg-purple-600 hover:bg-purple-700"
                  )}
                >
                  {loading ? "Loading..." : "Checkout"}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing your order, you agree to our Terms and Conditions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
