import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const SiteContentContext = createContext({ content: {}, updateSection: () => {} });

export function useSiteContent() {
  return useContext(SiteContentContext);
}

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState({});

  useEffect(() => {
    let active = true;
    let retryTimer = null;

    function loadContent(attempt = 1) {
      fetch("/api/content")
        .then((response) => {
          if (response.status === 503) throw Object.assign(new Error("503"), { retryable: true });
          if (!response.ok) throw new Error(`${response.status}`);
          return response.json();
        })
        .then((data) => {
          if (active && data && typeof data === "object" && !Array.isArray(data)) {
            setContent(data);
          }
        })
        .catch((error) => {
          if (!active) return;
          // Retry once after 4s on 503 (database cold start on Vercel)
          if (error.retryable && attempt < 2) {
            retryTimer = setTimeout(() => loadContent(attempt + 1), 4000);
          } else {
            console.warn("Website content could not be loaded:", error.message);
          }
        });
    }

    loadContent();
    return () => {
      active = false;
      if (retryTimer) clearTimeout(retryTimer);
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
