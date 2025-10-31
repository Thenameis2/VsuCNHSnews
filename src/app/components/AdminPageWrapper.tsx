"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";

export default function AdminPageWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const userJson = localStorage.getItem("user");
      if (!userJson) {
        router.replace("/login"); // redirect if not logged in
        return;
      }

      const user = JSON.parse(userJson);
      const docSnap = await getDoc(doc(db, "users", user.u_id));
      if (!docSnap.exists() || docSnap.data().role !== "admin") {
        router.replace("/"); // redirect if not admin
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return null; // redirecting

  return <>{children}</>;
}
