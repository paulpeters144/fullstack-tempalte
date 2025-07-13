import { secureCookie } from "@/util/cookie";
import { redirect, useLoaderData } from "@remix-run/react";

export async function clientLoader() {
   secureCookie.removeAll();
   return redirect("/");
}

export default function SignOutPage() {
   const _ = useLoaderData<typeof clientLoader>();
   return <></>;
}
