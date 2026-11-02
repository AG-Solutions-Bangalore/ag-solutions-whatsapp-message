import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import BASE_URL from "@/config/BaseUrl";
import { motion } from "framer-motion";
import { ButtonConfig } from "@/config/ButtonConfig";

const SignUp = () => {
  const [enquiryCompanyType, setEnquiryCompanyType] = useState("Individual");
  const [enquiryCompanyName, setEnquiryCompanyName] = useState("");
  const [enquiryCompanyMobile, setEnquiryCompanyMobile] = useState("");
  const [enquiryCompanyEmail, setEnquiryCompanyEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const payload = {
      enquiry_company_type: enquiryCompanyType,
      enquiry_company_name: enquiryCompanyName,
      enquiry_company_mobile: enquiryCompanyMobile,
      enquiry_company_email: enquiryCompanyEmail,
    };

    try {
      const res = await axios.post(
        `${BASE_URL}/api/panel-signup`,
        payload
      );

      if (res.status === 200) {
        const response = res.data;

        if (response.code === 200) {
          toast({
            title: "Success",
            description: response.msg,
          });
          navigate("/"); 
        } else {
          toast({
            title: "Error",
            description: response.msg,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Unexpected response from the server.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: error.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="relative flex flex-col justify-center items-center min-h-screen bg-gray-100"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ opacity: 1, x: 0 }}
        exit={{
          opacity: 0,
          x: -window.innerWidth,
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
      >
        <Card
          className={`w-72 md:w-80 max-w-md ${ButtonConfig.loginBackground} ${ButtonConfig.loginText}`}
        >
          <CardHeader className="space-y-1">
            <CardTitle
              className={`text-xl text-center${ButtonConfig.loginText}`}
            >
               <div className="font-semibold flex items-center space-x-2">
          <div className="font-semibold flex items-center space-x-2">
            <div className="flex items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-800">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-yellow-900 leading-tight">Messenger</span>

            </div>
            </div>
          </div>
              Sign Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                {/* Company Type (Radio Button) */}
                <div className="grid gap-2">
                  <Label className={`${ButtonConfig.loginText}`}>
                    Company Type
                  </Label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Individual"
                        checked={enquiryCompanyType === "Individual"}
                        onChange={(e) => setEnquiryCompanyType(e.target.value)}
                        className="mr-2"
                      />
                      Individual
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Common"
                        checked={enquiryCompanyType === "Common"}
                        onChange={(e) => setEnquiryCompanyType(e.target.value)}
                        className="mr-2"
                      />
                      Common
                    </label>
                  </div>
                </div>

                {/* Company Name */}
                <div className="grid gap-2">
                  <Label
                    htmlFor="companyName"
                    className={`${ButtonConfig.loginText}`}
                  >
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Enter your company name"
                    value={enquiryCompanyName}
                    onChange={(e) => setEnquiryCompanyName(e.target.value)}
                    required
                    className="bg-white text-black placeholder-gray-400 border-white"
                  />
                </div>

                {/* Mobile Number */}
                <div className="grid gap-2">
                  <Label
                    htmlFor="mobile"
                    className={`${ButtonConfig.loginText}`}
                  >
                    Mobile Number
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={enquiryCompanyMobile}
                    onChange={(e) => setEnquiryCompanyMobile(e.target.value)}
                    required
                    className="bg-white text-black placeholder-gray-400 border-white"
                    onKeyPress={(e) => {
                      if (!/[0-9.]/.test(e.key) && e.key !== "Backspace") {
                        e.preventDefault();
                      }
                    }}
                    maxLength={10}
                  />
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className={`${ButtonConfig.loginText}`}
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={enquiryCompanyEmail}
                    onChange={(e) => setEnquiryCompanyEmail(e.target.value)}
                    required
                    className="bg-white text-black placeholder-gray-400 border-white"
                  />
                </div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    type="submit"
                    className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} w-full`}
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing Up..." : "Sign Up"}
                  </Button>
                </motion.div>
              </div>
            </form>
            <CardDescription
              className={`flex justify-end mt-4 underline ${ButtonConfig.loginText}`}
            >
              <span onClick={() => navigate("/")} className="cursor-pointer">
                Already have an account? Sign In
              </span>
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SignUp;