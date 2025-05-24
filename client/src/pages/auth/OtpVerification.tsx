import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function OtpVerification() {
  const [_, navigate] = useLocation();
  const { signup, verifyOtp, isLoading } = useAuth();
  const { toast } = useToast();
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [isInvalid, setIsInvalid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const email = sessionStorage.getItem("signupEmail") || "";
  // const phone = sessionStorage.getItem("signupPhone") || "";

  useEffect(() => {
    if (!email) {
      navigate("/signup");
      toast({
        title: "Error",
        description: "Please complete the signup form first",
        variant: "destructive",
      });
    }



    // Start countdown
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate, toast]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto focus to next input
    if (value !== "" && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Reset invalid state when user starts typing
    if (isInvalid) {
      setIsInvalid(false);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // On backspace, clear current field and focus previous
    if (e.key === "Backspace" && index > 0 && otpValues[index] === "") {
      const newOtpValues = [...otpValues];
      newOtpValues[index - 1] = "";
      setOtpValues(newOtpValues);

      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("").slice(0, 6);
      const newOtpValues = [...otpValues];

      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtpValues[index] = digit;
        }
      });

      setOtpValues(newOtpValues);

      // Focus the next empty input or last input
      const nextEmptyIndex = newOtpValues.findIndex((val) => val === "");
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      const nextInput = document.getElementById(`otp-input-${focusIndex}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;

    setIsResending(true);
    try {

      // send a request to the api 
      const verifyResponse = await apiRequest("POST", "/api/auth/signup", {
        email: email,
      });
      if (verifyResponse?.message === "OTP sent successfully") {
        // Save details in sessionStorage for future steps
        setTimeLeft(30);
        var opt = otpValues.join("");
        setOtpValues(Array(6).fill(""));
        setIsInvalid(false);
        toast({
          title: "Success",
          description: `OTP has been resent to your email`,
        });

        navigate("/verify-otp");
      }

    } catch (error) {
      console.error("Resend OTP error:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const otp = otpValues.join("");
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      // First verify the OTP directly with the API
      //  const verifyResponse = await apiRequest("POST", "/api/auth/verify-otp", {
      //    email,
      //    otp
      //  });

      const verifyResponse = await verifyOtp(email, otp)

      if (verifyResponse) {
        // OTP verification successful
        // Then check if broker is connected (if needed)
        try {
          // Make sure email is not null before using it
          toast({
            title: "Success",
            description: "OTP verificatio successful",
          });
          await new Promise(resolve => setTimeout(resolve, 10));
          // If successful, navigate to the complete profile page
          navigate("/");
        } catch (brokerError) {
          console.error("Broker check error:", brokerError);
          // Still navigate even if broker check fails
          //  navigate("/complete-profile");
        }
      } else {
        // This should not happen since the API would throw an error for invalid OTP
        throw new Error("OTP verification failed");
      }



    } catch (error) {
      console.error("OTP verification error:", error);
      setIsInvalid(true);
      // Display error message using toast instead of rendering the error object directly
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify OTP",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Sign up</h1>
        <p className="text-sm text-neutral-600">
          Already an account?{" "}
          <a href="/signin" className="text-primary font-medium block text-end">
            Sign in
          </a>
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-neutral-700">
              Enter OTP
            </label>
            <div className="flex items-center text-sm">
              <span className="text-primary">Time left: {timeLeft}s</span>
              <button
                type="button"
                className={`ml-2 text-primary hover:text-primary/80 focus:outline-none ${timeLeft > 0 || isResending ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleResendOtp}
                disabled={timeLeft > 0 || isResending}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            {otpValues.map((value, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className={`otp-input ${isInvalid ? "error" : ""}`}
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {isInvalid && (
            <p className="mt-1 text-sm text-destructive">Invalid OTP</p>
          )}
        </div>

        <Button
          type="button"
          className="w-full"
          onClick={handleSubmit}
          disabled={isLoading || otpValues.some((val) => val === "")}
        >
          {isLoading ? "Verifying..." : "Verify"}
        </Button>

        <div className="relative flex items-center justify-center">
          <Separator className="flex-grow" />
          <span className="flex-shrink mx-4 text-neutral-400 text-sm">or</span>
          <Separator className="flex-grow" />
        </div>

        <Button type="button" variant="outline" className="w-full">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </Button>

        <p className="text-sm text-neutral-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-primary font-medium">
            Sign Up
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
