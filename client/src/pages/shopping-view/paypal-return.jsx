import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

function PaypalReturnPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const params = new URLSearchParams(location.search);
  const orderId = params.get("token");
  const dbOrderId = sessionStorage.getItem("currentOrderId");

  useEffect(() => {
    if (orderId && dbOrderId) {
      dispatch(capturePayment({ orderId, dbOrderId })).then((data) => {
        setIsProcessing(false);
        if (data?.payload?.success) {
          sessionStorage.removeItem("currentOrderId");
          toast({
            title: "Payment Successful!",
            description: "Your order has been confirmed.",
            variant: "default",
          });
          window.location.href = "/shop/payment-success";
        } else {
          toast({
            title: "Payment Failed",
            description: "There was an issue processing your payment. Please try again.",
            variant: "destructive",
          });
          window.location.href = "/shop/checkout";
        }
      }).catch((error) => {
        setIsProcessing(false);
        toast({
          title: "Payment Error",
          description: "An error occurred while processing your payment.",
          variant: "destructive",
        });
        window.location.href = "/shop/checkout";
      });
    } else {
      setIsProcessing(false);
      toast({
        title: "Invalid Payment",
        description: "Payment information is missing. Please try again.",
        variant: "destructive",
      });
      window.location.href = "/shop/checkout";
    }
  }, [orderId, dbOrderId, dispatch, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-10 max-w-md w-full mx-4">
        <CardHeader className="p-0 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <CardTitle className="text-2xl text-blue-600 mb-2">
            {isProcessing ? "Processing Payment..." : "Payment Complete"}
          </CardTitle>
          <p className="text-gray-600">
            {isProcessing 
              ? "Please wait while we process your payment..." 
              : "Redirecting you to the success page..."
            }
          </p>
        </CardHeader>
      </Card>
    </div>
  );
}

export default PaypalReturnPage;
