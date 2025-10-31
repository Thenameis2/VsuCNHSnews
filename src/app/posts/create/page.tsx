"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/app/components/Nav";

import { addDoc, collection, updateDoc, doc, getDocs } from "firebase/firestore";
import { auth, db, storage } from "../../../firebase";
import { getCurrentDate, slugifySentences } from "@/app/utils";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

interface Section {
  title: string;
  slug: string;
}

interface Tab {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
}

export default function PostCreate() {
  const [userData, setUserData] = useState<any>({});
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [selectedTab, setSelectedTab] = useState<Tab | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const router = useRouter();

  // Auth
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      user ? setUserData(user) : router.back();
    });
  }, [router]);

  // Fetch tabs from Firestore
  const fetchTabs = async () => {
    const snapshot = await getDocs(collection(db, "nav"));
    const data: Tab[] = [];
    snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Tab));
    setTabs(data);
    if (data.length > 0) {
      setSelectedTab(data[0]);
      setSelectedSection(data[0].sections[0] || null);
    }
  };

  useEffect(() => {
    fetchTabs();
  }, []);

  const handleFileReader = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      if (readerEvent.target && readerEvent.target.result) {
        setCoverPhoto(readerEvent.target.result as string);
      }
    };
  };

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTab || !selectedSection) return alert("Select tab and section");

    setUploading(true);

    // 1️⃣ Add post to Firestore
    const docRef = await addDoc(collection(db, "posts"), {
      author_id: userData.uid,
      title,
      content,
      tab_id: selectedTab.id,
      tab_slug: selectedTab.slug,
      section_slug: selectedSection.slug,
      author_name: userData.displayName,
      pub_date: getCurrentDate(),
      slug: slugifySentences(title),
      comments: [],
    });

    // 2️⃣ Upload cover photo
    if (coverPhoto) {
      const imageRef = ref(storage, `posts/${docRef.id}/image`);
      await uploadString(imageRef, coverPhoto, "data_url").then(async () => {
        const downloadURL = await getDownloadURL(imageRef);
        await updateDoc(doc(db, "posts", docRef.id), {
          image_url: downloadURL,
        });
      });
    }

    setUploading(false);
    alert("Post created successfully!");
    router.push("/news"); // redirect to news page
  };

  return (
    <div>
      <Nav />
      <main className="md:px-8 py-8 px-4 w-full">
        <form className="flex flex-col w-full" onSubmit={handleCreatePost}>
          <label htmlFor="title" className="text-sm text-blue-600">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
            className="px-4 py-3 border-2 rounded-md text-lg mb-4"
          />

          <label htmlFor="content" className="text-sm text-blue-600">
            Content
          </label>
          <textarea
            name="content"
            rows={15}
            value={content}
            required
            onChange={(e) => setContent(e.target.value)}
            id="content"
            className="px-4 py-3 border-2 rounded-md mb-4"
          ></textarea>

          <label htmlFor="tab" className="text-sm text-blue-600">
            Select Tab
          </label>
          <select
            id="tab"
            value={selectedTab?.id || ""}
            onChange={(e) => {
              const tab = tabs.find((t) => t.id === e.target.value) || null;
              setSelectedTab(tab);
              setSelectedSection(tab?.sections[0] || null);
            }}
            className="px-4 py-3 border-2 rounded-md mb-4"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.title}
              </option>
            ))}
          </select>

          <label htmlFor="section" className="text-sm text-blue-600">
            Select Section
          </label>
          <select
            id="section"
            value={selectedSection?.slug || ""}
            onChange={(e) => {
              const section = selectedTab?.sections.find((s) => s.slug === e.target.value) || null;
              setSelectedSection(section);
            }}
            className="px-4 py-3 border-2 rounded-md mb-4"
          >
            {selectedTab?.sections.map((section) => (
              <option key={section.slug} value={section.slug}>
                {section.title}
              </option>
            ))}
          </select>

          <label htmlFor="upload" className="text-sm text-blue-600">
            Upload Cover Photo
          </label>
          <input
            type="file"
            name="upload"
            id="upload"
            required
            onChange={handleFileReader}
            className="px-4 py-3 border-2 rounded-md mb-4"
            accept="image/jpeg, image/png"
          />

          <button
            type="submit"
            className="bg-blue-600 mt-4 text-white py-4 rounded-md"
            disabled={uploading}
          >
            {uploading ? "Creating post..." : "Create Post"}
          </button>
        </form>
      </main>
    </div>
  );
}
