"use client";
// pages/admin-login.js
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useAuth } from "../../context/auth";
import { useRouter } from "next/navigation";

const AdminLogin = () => {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (result) => {
    console.log("QR Code scanned:", result);
    // Check if QR code data is valid
    if (!result || !result[0] || !result[0].rawValue) {
      throw new Error("Invalid QR code data");
    }

    // Call handle function directly with the QR code
    handle(result[0].rawValue);
  };

  const handle = async (qr_id) => {
    try {
      // Send the scanned QR code to your API for validation
      const response = await fetch("https://aoncodev.work.gd/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qr_id: qr_id }),
      });

      if (!response.ok) {
        throw new Error(
          "Failed to authenticate. Invalid QR code or server error."
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Check the user role
      if (data.role === "admin") {
        login(data); // Pass user data if needed
        router.push("/");
      } else {
        throw new Error("Access denied: User is not an admin.");
      }
    } catch (error) {
      console.error("Login failed:", error.message);
      alert(`Authentication failed: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Card className="w-[400px] bg-white/10 backdrop-blur-md border-0">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Admin Login
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full aspect-square mb-6 overflow-hidden rounded-xl border-4 border-blue-500/50">
            <Scanner
              onScan={(result) => handleLogin(result)}
              onError={(error) => console.error("QR Scan Error:", error)}
              styles={{
                video: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                },
              }}
            />
          </div>
          <p className="text-sm text-blue-300 text-center mb-6">
            Scan your QR code to login
          </p>
          <Button
            variant="secondary"
            className="w-full bg-white/20 hover:bg-white/30 text-white"
            onClick={() => router.push("/password-login")} // Optional route for password login
          >
            Use Password Instead
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
