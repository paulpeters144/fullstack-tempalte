import { redirect, useLoaderData } from "@remix-run/react";
import { secureCookie } from "~/util/cookie";

export async function clientLoader() {
   secureCookie.removeAll();
   return redirect("/");
}

export default function SignOutPage() {
   const _ = useLoaderData<typeof clientLoader>();
   return <></>;
}
