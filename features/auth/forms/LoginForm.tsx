"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authLoginSchema } from "@/features/auth/schemas/auth.schema";
import { login } from "@/features/auth/actions/auth";
import { useToast } from "@/hooks/use-toast";
import { RequiredLabelIcon } from "@/components/RequiredLabelIcon";
import { GoogleLoginButton } from "../components/google-login-button";
import { useSearchParams } from "next/navigation";
import { SocialAuthErrorText } from "../components/SocialAuthErrorText";

export function LoginForm() {
  const { toast } = useToast();
    const searchParams = useSearchParams();
    const queryError = searchParams?.get("error");
  const form = useForm<z.infer<typeof authLoginSchema>>({
    resolver: zodResolver(authLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof authLoginSchema>) {
    const data = await login(values);

    if (data?.message) {
      toast({
        title: data.error ? "Error" : "Success",
        description: data.message,
        variant: data.error ? "destructive" : "default",
      });
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
            Welcome Back
          </h1>
          <p className="text-gray-500 mt-2">
            Sign in to continue to your workspace
          </p>
        </div>
        {queryError && <div className="mb-6">
          <SocialAuthErrorText error={queryError || ""} />
        </div>}
        <div className="space-y-4">
          <GoogleLoginButton
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`;
            }}
          />

          <div className="relative flex items-center gap-4 my-6">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-gray-400 text-sm font-medium">OR</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex  flex-col  gap-6 "
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-stone-700">
                      Email
                      <RequiredLabelIcon />
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="text-black border-none  focus:outline-none
    focus:ring-0
    focus:border-transparent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-stone-700 ">
                      Password
                      <RequiredLabelIcon />
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="text-black border-none  focus:outline-none
    focus:ring-0
    focus:border-transparent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-center">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                  disabled={form.formState.isSubmitting}
                  type="submit"
                >
                  Login
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
