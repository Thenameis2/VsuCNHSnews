"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { handleSignOut } from "../utils";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

import { db } from "@/firebase";

export default function Nav() {
  const [displayName, setDisplayName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [tabs, setTabs] = useState<any[]>([]);
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      const userJson = localStorage.getItem("user");
      if (!userJson) return;

      const user = JSON.parse(userJson);
      setDisplayName(user.displayName);
      setUserId(user.u_id);

      // Fetch role from Firestore
      const docSnap = await getDoc(doc(db, "users", user.u_id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsAdmin(data.role === "admin");
      }
    };

    fetchUserRole();
    fetchTabs();
  }, []);

  // Fetch nav tabs from Firestore
  const fetchTabs = async () => {
    const snapshot = await getDocs(collection(db, "nav"));
    const data: any[] = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    // Optional: sort by 'order'
    data.sort((a, b) => (a.order || 0) - (b.order || 0));

    setTabs(data);
  };

  // Helper function to ensure slug starts with /
  const normalizeSlug = (slug: string | undefined) => {
    if (!slug) return "#";
    return slug.startsWith("/") ? slug : `/${slug}`;
  };

  return (
    <nav className="w-full py-4 border-b-2 px-8 sticky top-0 bg-[#f5f7ff] flex flex-col items-center z-50">
      <div className="w-full flex items-center justify-between relative">
        {/* Logo */}
        <div className="flex items-center">
          <img src="/tojans.png" alt="Logo" className="h-10 w-10 mr-2" />
        </div>

        {/* Site title */}
        <div className="flex-1 text-center">
          <Link href="/" className="text-2xl font-bold">
            VsuCNHSnews
          </Link>
        </div>

        {/* User menu */}
        <div className="flex items-center">
          {displayName ? (
            <button
              className="p-2 rounded-md hover:bg-gray-200"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-blue-500 text-white px-6 py-3 rounded-md"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Dropdown menu */}
        {menuOpen && (
          <div className="absolute top-14 right-0 bg-white shadow-lg rounded-md p-4 flex flex-col gap-3 border">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md"
              onClick={() => {
                handleSignOut();
                setMenuOpen(false);
              }}
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      {/* Dynamic nav tabs */}
      <div className="mt-3 flex justify-center gap-8 flex-wrap">
        {tabs
          .filter((tab) => !tab.adminOnly || isAdmin)
          .map((tab) => (
            <div key={tab.id} className="relative group">
              {/* Tab link - NOW WITH NORMALIZED SLUG */}
              <Link
                href={normalizeSlug(tab.slug)}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                {tab.title}
              </Link>

              {/* Sections dropdown */}
              {/* {tab.sections && tab.sections.length > 0 && (
                <div className="absolute left-0 mt-2 bg-white shadow-md rounded-md p-2 hidden group-hover:block min-w-[140px] z-50">
                  {tab.sections.map((section: any, index: number) => (
                    <Link
                      key={index}
                      href={`${normalizeSlug(tab.slug)}/${section.slug}`}
                      className="block px-2 py-1 text-gray-700 hover:bg-blue-100 rounded-md"
                    >
                      {section.title}
                    </Link>
                  ))}
                </div>
              )} */}
            </div>
          ))}
      </div>
    </nav>
  );
}