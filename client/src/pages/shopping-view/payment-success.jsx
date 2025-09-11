import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

function PaymentSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-10 max-w-md w-full mx-4">
        <CardHeader className="p-0 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle className="text-3xl text-green-600 mb-2">Payment Successful!</CardTitle>
          <p className="text-gray-600 mb-6">
            Your order has been confirmed and will be processed shortly. 
            This was a demo payment for testing purposes.
          </p>
        </CardHeader>
        <div className="space-y-3">
          <Button 
            className="w-full" 
            onClick={() => navigate("/shop/account")}
          >
            View My Orders
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate("/shop/home")}
          >
            Continue Shopping
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default PaymentSuccessPage;
