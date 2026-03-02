import { redirect } from "next/navigation";

export default function RootPage() {
  // This automatically sends the user to http://localhost:3000/auth
  redirect("/auth");
  
  // This return is never reached but required for the component structure
  return null; 
}