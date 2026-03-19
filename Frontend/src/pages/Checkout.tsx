import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetCartQuery } from "@/store/api/cartApi";
import { useCreateOrderMutation } from "@/store/api/orderApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ChevronLeft, CreditCard, Landmark, Wallet, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCreateRazorpayOrderMutation, useVerifyPaymentMutation } from "@/store/api/paymentApi";
import { useGetProfileQuery } from "@/store/api/authApi";

declare global {
  interface Window {
    Razorpay: any; // Razorpay doesn't provide easy types, keeping as any for now but wrapped in global
  }
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useGetCartQuery({});
  const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();
  const [createRazorpayOrder, { isLoading: isCreatingRPOrder }] = useCreateRazorpayOrderMutation();
  const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();
  const { data: user } = useGetProfileQuery();
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Pre-fill from profile
  useEffect(() => {
    if (user) {
      setShippingAddress({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        pincode: user.pincode || "",
      });
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState("Online Payment");
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-redirect after successful payment
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total: number, item: CartItem) => total + item.product.price * item.quantity, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress({ ...shippingAddress, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!shippingAddress.name.trim()) newErrors.name = "Full Name is required";
    else if (shippingAddress.name.length < 3) newErrors.name = "Name must be at least 3 characters";

    if (!shippingAddress.phone.trim()) newErrors.phone = "Phone Number is required";
    else if (!/^\d{10}$/.test(shippingAddress.phone)) newErrors.phone = "Enter a valid 10-digit phone number";

    if (!shippingAddress.address.trim()) newErrors.address = "Full Address is required";
    else if (shippingAddress.address.length < 10) newErrors.address = "Address must be at least 10 characters";

    if (!shippingAddress.city.trim()) newErrors.city = "City is required";

    if (!shippingAddress.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(shippingAddress.pincode)) newErrors.pincode = "Enter a valid 6-digit pincode";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    try {
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        toast.error("Razorpay is not loaded. Please refresh the page.");
        return;
      }

      toast.loading("Initiating payment...");

      // Use actual total amount for payment
      const totalAmount = calculateTotal();
      const razorpayOrder = await createRazorpayOrder(totalAmount).unwrap();

      if (!razorpayOrder || !razorpayOrder.id) {
        toast.error("Failed to create payment order");
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "MaurMart",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // 3. Verify Payment on Backend
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();

            if (verificationResult.success) {
              const orderData = {
                items: cart.items.map((item: CartItem) => ({
                  product: item.product._id,
                  quantity: item.quantity,
                  price: item.product.price,
                })),
                shippingAddress,
                paymentMethod: "Online Payment",
                totalPrice: calculateTotal(),
                razorpay_payment_id: response.razorpay_payment_id,
              };

              await createOrder(orderData).unwrap();
              toast.dismiss(); // Dismiss loading toast
              setIsSuccess(true);
              toast.success("Payment successful and order placed!");
            } else {
              toast.dismiss(); // Dismiss loading toast
              toast.error("Payment verification failed");
            }
          } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            console.error("Payment verification error:", err);
            toast.dismiss(); // Dismiss loading toast
            toast.error(error.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: shippingAddress.name,
          contact: shippingAddress.phone,
        },
        theme: {
          color: "#10b981",
        },
        modal: {
          ondismiss: () => {
            toast.dismiss(); // Dismiss loading toast if user closes payment modal
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      console.error("Payment error:", err);
      toast.error(error.data?.message || "Error initializing payment");
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!cart?.items?.length && !isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Button onClick={() => navigate("/shop")}>Go to Shop</Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been placed successfully and is being processed.
          </p>
          <div className="pt-4">
            <Button className="w-full rounded-xl" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <Button 
          variant="ghost" 
          className="mb-6 gap-2 hover:bg-transparent p-0" 
          onClick={() => navigate("/cart")}
        >
          <ChevronLeft className="w-4 h-4" /> Back to Cart
        </Button>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl p-6 border shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm">1</span>
                Shipping Address
              </h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                  <Input id="name" name="name" placeholder="Enter Your Full Name" value={shippingAddress.name} onChange={handleInputChange} className={`rounded-xl ${errors.name ? "border-destructive ring-destructive" : ""}`} />
                  {errors.name && <p className="text-[10px] text-destructive font-medium px-1">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                  <Input id="phone" name="phone" placeholder="Enter Your Mobile Number" value={shippingAddress.phone} onChange={handleInputChange} className={`rounded-xl ${errors.phone ? "border-destructive ring-destructive" : ""}`} />
                  {errors.phone && <p className="text-[10px] text-destructive font-medium px-1">{errors.phone}</p>}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Full Address <span className="text-destructive">*</span></Label>
                  <Input id="address" name="address" placeholder="Enter Your Full Address" value={shippingAddress.address} onChange={handleInputChange} className={`rounded-xl ${errors.address ? "border-destructive ring-destructive" : ""}`} />
                  {errors.address && <p className="text-[10px] text-destructive font-medium px-1">{errors.address}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                  <Input id="city" name="city" placeholder="Enter Your City" value={shippingAddress.city} onChange={handleInputChange} className={`rounded-xl ${errors.city ? "border-destructive ring-destructive" : ""}`} />
                  {errors.city && <p className="text-[10px] text-destructive font-medium px-1">{errors.city}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode <span className="text-destructive">*</span></Label>
                  <Input id="pincode" name="pincode" placeholder="Enter Your Pincode" value={shippingAddress.pincode} onChange={handleInputChange} className={`rounded-xl ${errors.pincode ? "border-destructive ring-destructive" : ""}`} />
                  {errors.pincode && <p className="text-[10px] text-destructive font-medium px-1">{errors.pincode}</p>}
                </div>
              </form>
            </section>

            <section className="bg-white rounded-2xl p-6 border shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm">2</span>
                Payment Method
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Select your preferred payment method. Cash on Delivery is currently unavailable.</p>
              
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <div className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "Online Payment" ? "border-primary bg-primary/5 shadow-sm" : "hover:border-border/80"}`} onClick={() => setPaymentMethod("Online Payment")}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="Online Payment" id="online" />
                    <div>
                      <Label htmlFor="online" className="font-semibold cursor-pointer">Online Payment (Razorpay)</Label>
                      <p className="text-xs text-muted-foreground">Pay via Cards, Netbanking, or Wallets</p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "UPI" ? "border-primary bg-primary/5 shadow-sm" : "hover:border-border/80"}`} onClick={() => setPaymentMethod("UPI")}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="UPI" id="upi" />
                    <div>
                      <Label htmlFor="upi" className="font-semibold cursor-pointer">UPI</Label>
                      <p className="text-xs text-muted-foreground">Google Pay, PhonePe, Paytm</p>
                    </div>
                  </div>
                  <Landmark className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "Card" ? "border-primary bg-primary/5 shadow-sm" : "hover:border-border/80"}`} onClick={() => setPaymentMethod("Card")}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="Card" id="card" />
                    <div>
                      <Label htmlFor="card" className="font-semibold cursor-pointer">Credit / Debit Card</Label>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, RuPay</p>
                    </div>
                  </div>
                  <Landmark className="w-5 h-5 text-muted-foreground" />
                </div>
              </RadioGroup>
            </section>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 border shadow-sm sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {cart.items.map((item: CartItem) => (
                  <div key={item.product._id} className="flex gap-4">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-16 h-16 object-cover rounded-lg border" 
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold">₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{calculateTotal().toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-primary font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span>₹{calculateTotal().toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Button 
                className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20" 
                onClick={handlePayment}
                disabled={isPlacingOrder || isCreatingRPOrder}
              >
                {isPlacingOrder || isCreatingRPOrder ? "Processing..." : `Pay ₹${calculateTotal().toLocaleString("en-IN")}`}
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Wallet className="w-3 h-3" />
                Secure Payment Powered by MaurMart
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
