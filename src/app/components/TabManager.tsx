// Updated TabManager.tsx with right-aligned Edit/Delete buttons
"use client";

import { useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase";

interface Section {
  title: string;
  slug: string;
}

interface Tab {
  id: string;
  title: string;
  sections: Section[];
  order: number;
  adminOnly: boolean;
}

interface TabEditState {
  [tabId: string]: boolean;
}

interface SectionEditState {
  [tabId: string]: boolean[];
}

interface AddingSectionState {
  [tabId: string]: boolean;
}

export default function TabManager() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [tabTitle, setTabTitle] = useState("");
  const [sectionInput, setSectionInput] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [isAdminOnly, setIsAdminOnly] = useState(false);

  const [tabEditMode, setTabEditMode] = useState<TabEditState>({});
  const [sectionEditMode, setSectionEditState] = useState<SectionEditState>({});
  const [addingSection, setAddingSection] = useState<AddingSectionState>({});
  const [newSectionText, setNewSectionText] = useState<{ [tabId: string]: string }>({});

  const generateSlug = (text: string) =>
    text.toLowerCase().trim().replace(/[\s]+/g, "-").replace(/[^\w-]/g, "");

  useEffect(() => {
    const q = query(collection(db, "nav"), orderBy("order"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Tab[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Tab));
      setTabs(data);

      const newTabEdit: TabEditState = {};
      const newSectionEdit: SectionEditState = {};
      const newAddingSection: AddingSectionState = {};
      const newSectionTextState: { [tabId: string]: string } = {};

      data.forEach((tab) => {
        newTabEdit[tab.id] = false;
        newSectionEdit[tab.id] = tab.sections.map(() => false);
        newAddingSection[tab.id] = false;
        newSectionTextState[tab.id] = "";
      });

      setTabEditMode(newTabEdit);
      setSectionEditState(newSectionEdit);
      setAddingSection(newAddingSection);
      setNewSectionText(newSectionTextState);
    });
    return () => unsubscribe();
  }, []);

  const addSection = () => {
    if (sectionInput.trim()) {
      setSections([...sections, { title: sectionInput.trim(), slug: generateSlug(sectionInput) }]);
      setSectionInput("");
    }
  };

  const handleCreateTab = async () => {
    if (!tabTitle.trim()) return alert("Add a title");

    await addDoc(collection(db, "nav"), {
      title: tabTitle.trim(),
      slug: generateSlug(tabTitle),
      sections,
      order: tabs.length + 1,
      adminOnly: isAdminOnly,
    });

    setTabTitle("");
    setSections([]);
    setIsAdminOnly(false);
  };

  const handleDeleteTab = async (id: string) => {
    if (confirm("Delete this tab?")) await deleteDoc(doc(db, "nav", id));
  };

  const handleUpdateTab = async (tab: Tab) => {
    await updateDoc(doc(db, "nav", tab.id), {
      title: tab.title,
      sections: tab.sections.map((s) => ({ title: s.title, slug: generateSlug(s.title) })),
      adminOnly: tab.adminOnly,
    });
    setTabEditMode((p) => ({ ...p, [tab.id]: false }));
  };

  const toggleTabEdit = (id: string) => setTabEditMode((p) => ({ ...p, [id]: !p[id] }));

  const toggleSectionEdit = (tabId: string, i: number) => {
    setSectionEditState((p) => ({
      ...p,
      [tabId]: p[tabId].map((v, x) => (x === i ? !v : v)),
    }));
  };

  const updateTabField = (id: string, field: keyof Tab, value: any) => {
    setTabs((p) => p.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const updateSectionField = (tabId: string, idx: number, value: string) => {
    setTabs((p) => p.map((t) => (t.id === tabId ? {
      ...t,
      sections: t.sections.map((s, i) => (i === idx ? { ...s, title: value } : s)),
    } : t)));
  };

  const deleteSectionFromTab = (tabId: string, idx: number) => {
    setTabs((p) => p.map((t) => (t.id === tabId ? {
      ...t,
      sections: t.sections.filter((_, i) => i !== idx),
    } : t)));
    setSectionEditState((p) => ({ ...p, [tabId]: p[tabId].filter((_, i) => i !== idx) }));
  };

  const startAddingSection = (id: string) => setAddingSection((p) => ({ ...p, [id]: true }));
  const cancelAddingSection = (id: string) => {
    setAddingSection((p) => ({ ...p, [id]: false }));
    setNewSectionText((p) => ({ ...p, [id]: "" }));
  };

  const saveNewSection = async (tabId: string) => {
    const text = newSectionText[tabId].trim();
    if (!text) return;

    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const updated = {
      ...tab,
      sections: [...tab.sections, { title: text, slug: generateSlug(text) }],
    };
    await handleUpdateTab(updated);
    cancelAddingSection(tabId);
  };

  return (
    <div className="space-y-8">
      <div className="p-6 border rounded-md shadow-md">
        <h1 className="text-2xl font-bold mb-4">Create Nav Tab & Sections</h1>
        <input className="w-full px-4 py-2 border rounded-md mb-4" value={tabTitle} onChange={(e) => setTabTitle(e.target.value)} placeholder="Tab Title" />
        <div className="flex gap-2 mb-2">
          <input className="flex-1 px-4 py-2 border rounded-md" value={sectionInput} onChange={(e) => setSectionInput(e.target.value)} placeholder="Section name" />
          <button onClick={addSection} className="bg-blue-600 text-white px-4 rounded-md">Add</button>
        </div>
        {sections.map((s, i) => <div key={i}>{s.title}</div>)}
        <div className="flex items-center mb-4">
          <input type="checkbox" checked={isAdminOnly} onChange={(e) => setIsAdminOnly(e.target.checked)} className="mr-2" /> Admin Only
        </div>
        <button onClick={handleCreateTab} className="bg-green-600 text-white px-6 py-3 rounded-md">Create Tab</button>
      </div>

      <div className="p-6 border rounded-md shadow-md">
        <h2 className="text-xl font-bold mb-4">Existing Tabs</h2>
        {tabs.map((tab) => (
          <div key={tab.id} className="border p-4 rounded-md mb-3">
            <div className="flex items-center w-full">
              {tabEditMode[tab.id] ? (
                <>
                  <input className="border px-2 py-1 rounded-md flex-1 mr-2" value={tab.title} onChange={(e) => updateTabField(tab.id, "title", e.target.value)} />
                  <label className="mr-2 flex items-center gap-1"><input type="checkbox" checked={tab.adminOnly} onChange={(e) => updateTabField(tab.id, "adminOnly", e.target.checked)} />Admin</label>
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => handleUpdateTab(tab)} className="bg-green-500 text-white px-3 py-1 rounded-md">Save</button>
                    <button onClick={() => toggleTabEdit(tab.id)} className="bg-gray-400 text-white px-3 py-1 rounded-md">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <span className="font-semibold">{tab.title}</span>
                  {tab.adminOnly && <span className="text-red-500 ml-2">Admin</span>}
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => toggleTabEdit(tab.id)} className="bg-blue-500 text-white px-3 py-1 rounded-md">Edit</button>
                    <button onClick={() => handleDeleteTab(tab.id)} className="bg-red-500 text-white px-3 py-1 rounded-md">Delete</button>
                  </div>
                </>
              )}
            </div>

            <ul className="ml-4 mt-2 space-y-1">
              {tab.sections.map((section, idx) => (
                <li key={idx} className="flex items-center w-full">
                  {sectionEditMode[tab.id][idx] ? (
                    <>
                      <input className="border px-2 py-1 rounded-md flex-1 mr-2" value={section.title} onChange={(e) => updateSectionField(tab.id, idx, e.target.value)} />
                      <div className="ml-auto flex gap-2">
                        <button onClick={async () => { await handleUpdateTab(tab); toggleSectionEdit(tab.id, idx); }} className="bg-green-500 text-white px-2 py-1 rounded-md">Save</button>
                        <button onClick={() => toggleSectionEdit(tab.id, idx)} className="bg-gray-400 text-white px-2 py-1 rounded-md">Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>{section.title}</span>
                      <div className="ml-auto flex gap-2">
                        <button onClick={() => toggleSectionEdit(tab.id, idx)} className="bg-blue-500 text-white px-2 py-1 rounded-md">Edit</button>
                        <button onClick={() => deleteSectionFromTab(tab.id, idx)} className="bg-red-400 text-white px-2 py-1 rounded-md">Delete</button>
                      </div>
                    </>
                  )}
                </li>
              ))}

              {addingSection[tab.id] ? (
                <li className="flex items-center w-full mt-1">
                  <input className="border px-2 py-1 rounded-md flex-1 mr-2" value={newSectionText[tab.id]} onChange={(e) => setNewSectionText((p) => ({ ...p, [tab.id]: e.target.value }))} placeholder="New section name" />
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => saveNewSection(tab.id)} className="bg-green-500 text-white px-2 py-1 rounded-md">Save</button>
                    <button onClick={() => cancelAddingSection(tab.id)} className="bg-gray-400 text-white px-2 py-1 rounded-md">Cancel</button>
                  </div>
                </li>
              ) : (
                <li>
                  <button onClick={() => startAddingSection(tab.id)} className="bg-blue-500 text-white px-3 py-1 rounded-md mt-1">+ Add Section</button>
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
