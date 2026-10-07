import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const SiteContentContext = createContext({ content: {}, updateSection: () => {} });

export function useSiteContent() {
  return useContext(SiteContentContext);
}

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState({});

  useEffect(() => {
    let active = true;
    fetch("/api/content")
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load website content (${response.status}).`);
        return response.json();
      })
      .then((data) => {
        if (active && data && typeof data === "object" && !Array.isArray(data)) {
          setContent(data);
        }
      })
      .catch((error) => {
        console.warn("Website content could not be loaded:", error);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateSection = useCallback((section, value) => {
    setContent((previous) => ({ ...previous, [section]: value }));
  }, []);

  return (
    <SiteContentContext.Provider value={{ content, updateSection }}>
      {children}
    </SiteContentContext.Provider>
  );
}
