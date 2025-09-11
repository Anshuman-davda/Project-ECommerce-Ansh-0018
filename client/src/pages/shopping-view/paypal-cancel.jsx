import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

function PaypalCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-10 max-w-md w-full mx-4">
        <CardHeader className="p-0 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-3xl text-red-600 mb-2">Payment Cancelled</CardTitle>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled. No charges have been made to your account.
            You can try again or continue shopping.
          </p>
        </CardHeader>
        <div className="space-y-3">
          <Button 
            className="w-full" 
            onClick={() => navigate("/shop/checkout")}
          >
            Try Again
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

export default PaypalCancelPage;
