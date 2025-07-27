import { Metadata } from "next";
import { getSessionFromCookie, getSessionOrGuest } from "@/utils/auth";
import SignUpClientComponent from "./sign-up.client";
import { redirect } from "next/navigation";
import { REDIRECT_AFTER_SIGN_IN } from "@/constants";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

const SignUpPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) => {
  const { redirect: redirectParam } = await searchParams;
  
  // Check for authenticated user session (not guest)
  const userSession = await getSessionFromCookie();
  const redirectPath = redirectParam ?? REDIRECT_AFTER_SIGN_IN as unknown as string;

  // If user is already authenticated, redirect them
  if (userSession) {
    return redirect(redirectPath);
  }

  // Check if there's an active guest session for context
  const sessionOrGuest = await getSessionOrGuest();
  const hasGuestSession = sessionOrGuest && 'type' in sessionOrGuest;

  return <SignUpClientComponent 
    redirectPath={redirectPath} 
    hasGuestSession={hasGuestSession}
  />
}

export default SignUpPage;
