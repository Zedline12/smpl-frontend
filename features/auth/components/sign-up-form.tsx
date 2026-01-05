"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../hooks/use-auth";
import { GoogleLoginButton } from "./google-login-button";

export function SignUpForm() {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(formData);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
            Create Account
          </h1>
          <p className="text-gray-500 mt-2">
            Get started with your free account today
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-fade-in-up">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <GoogleLoginButton
            onClick={() => console.log("Google login clicked")}
          />

          <div className="relative flex items-center gap-4 my-6">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-gray-400 text-sm font-medium">OR</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="firstName"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="lastName"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98] mt-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
