import { redirect } from "next/navigation";

// The app has no landing page; send visitors straight to the print view.
export default function Home() {
  redirect("/print");
}
