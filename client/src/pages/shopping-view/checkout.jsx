import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder, capturePayment } from "@/store/shop/order-slice";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

// Prevent PayPal from loading and causing errors
if (typeof window !== 'undefined') {
  window.paypal = null;
  // Override PayPal initialization to prevent errors
  window.addEventListener('DOMContentLoaded', () => {
    if (window.paypal) {
      window.paypal = null;
    }
  });
}

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [dbOrderId, setDbOrderId] = useState(null);
  const dispatch = useDispatch();
  const { toast } = useToast();

  console.log(currentSelectedAddress, "cartItems");

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  async function handleCreatePayPalOrder() {
    if (!cartItems || !cartItems.items || cartItems.items.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }
    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsPaymemntStart(true);

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "demo",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    try {
      const result = await dispatch(createNewOrder(orderData)).unwrap();
      console.log('Order created:', result);
      
      if (result?.success && result?.orderId) {
        setPaypalOrderId(result.orderId);
        setDbOrderId(result.dbOrderId);
        sessionStorage.setItem("currentOrderId", result.dbOrderId);
        
        // Handle demo payment immediately
        await handleDemoPayment(result);
      } else {
        toast({
          title: "Order Error",
          description: "Could not create order. Please try again.",
          variant: "destructive",
        });
        setIsPaymemntStart(false);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        title: "Checkout Error",
        description: error?.message || "Could not process checkout. Please try again.",
        variant: "destructive",
      });
      setIsPaymemntStart(false);
    }
  }

  async function handleDemoPayment(result) {
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Capture the payment (simulate successful payment)
      const captureResult = await dispatch(capturePayment({
        orderId: result.orderId,
        dbOrderId: result.dbOrderId
      })).unwrap();
      
      if (captureResult?.success) {
        toast({
          title: "Payment Successful!",
          description: "Your order has been confirmed. This was a demo payment.",
          variant: "default",
        });
        setIsPaymemntStart(false);
        window.location.href = "/shop/payment-success";
      } else {
        toast({
          title: "Payment Error",
          description: "Payment failed. Please try again.",
          variant: "destructive",
        });
        setIsPaymemntStart(false);
      }
    } catch (error) {
      console.error('Demo payment error:', error);
      toast({
        title: "Payment Error",
        description: "Payment failed. Please try again.",
        variant: "destructive",
      });
      setIsPaymemntStart(false);
    }
  }


  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent cartItem={item} />
              ))
            : null}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">${totalCartAmount}</span>
            </div>
          </div>
          <div className="mt-4 w-full">
            {/* Demo Payment Button - Always Available */}
            <Button 
              onClick={handleCreatePayPalOrder}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isPaymentStart}
            >
              {isPaymentStart ? "Processing Payment..." : "Complete Payment"}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This will process a demo payment. Your order will be created and confirmed immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
