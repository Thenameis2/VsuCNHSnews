"use client";

import { useState } from "react";
import PostCreate from "@/app/components/PostCreate";
import CreatedNews from "@/app/components/CreatedNews";
import TabManager from "@/app/components/TabManager";
import AdminPageWrapper from "@/app/components/AdminPageWrapper";

export default function AdminPage() {
  const [activeSidebar, setActiveSidebar] = useState<
    "tabs" | "createNews" | "createdNews" | "refresh"
  >("tabs");

  const triggerRevalidate = async (pagePath: string) => {
    try {
      const userJson = localStorage.getItem("user");
      if (!userJson) throw new Error("User not logged in");
      const user = JSON.parse(userJson);
  
      const res = await fetch(
        `/api/revalidate/${pagePath.replace("/", "")}?userId=${user.u_id}`
      );
      const data = await res.json();
  
      if (res.ok) alert(`Page "${pagePath}" revalidated successfully!`);
      else alert(`Error: ${data.message}`);
    } catch (err) {
      alert(`Error calling revalidation endpoint: ${err}`);
    }
  };
  

  return (
    <AdminPageWrapper>
      <div className="flex max-w-7xl mx-auto py-12 px-6 gap-10">
        {/* Sidebar */}
        <div className="w-64 sticky top-32 self-start border rounded-md p-4 space-y-4">
          {[
            { key: "tabs", label: "Tabs", color: "blue" },
            { key: "createNews", label: "Create News", color: "green" },
            { key: "createdNews", label: "Created News", color: "purple" },
            { key: "refresh", label: "Refresh Pages", color: "yellow" },
          ].map((btn) => (
            <button
              key={btn.key}
              className={`w-full text-left px-3 py-2 rounded-md ${
                activeSidebar === btn.key
                  ? `bg-${btn.color}-600 text-white font-semibold`
                  : "text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveSidebar(btn.key as any)}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-8">
          {activeSidebar === "tabs" && <TabManager />}

          {activeSidebar === "createNews" && (
            <div className="p-6 border rounded-md shadow-md">
              <h1 className="text-2xl font-bold mb-4">Create News Article</h1>
              <PostCreate />
            </div>
          )}

          {activeSidebar === "createdNews" && (
            <div className="p-6 border rounded-md shadow-md">
              <h1 className="text-2xl font-bold mb-4">Created News</h1>
              <CreatedNews />
            </div>
          )}

          {activeSidebar === "refresh" && (
            <div className="p-6 border rounded-md shadow-md">
              <h1 className="text-2xl font-bold mb-4">Manual Page Refresh</h1>
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() => triggerRevalidate("/research")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md"
                >
                  Refresh Research
                </button>
                <button
                  onClick={() => triggerRevalidate("/news")}
                  className="bg-green-600 text-white px-6 py-3 rounded-md"
                >
                  Refresh News
                </button>
                <button
                  onClick={() => triggerRevalidate("home")}
                  className="bg-purple-600 text-white px-6 py-3 rounded-md"
                >
                  Refresh Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminPageWrapper>
  );
}
