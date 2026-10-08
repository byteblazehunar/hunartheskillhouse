import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function usePortalTab(allowedTabs, defaultTab = "overview") {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = allowedTabs.includes(requestedTab) ? requestedTab : defaultTab;

  useEffect(() => {
    if (!requestedTab || allowedTabs.includes(requestedTab)) return;

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("tab");
      return next;
    }, { replace: true, preventScrollReset: true });
  }, [allowedTabs, requestedTab, setSearchParams]);

  const setActiveTab = useCallback((tab) => {
    if (!allowedTabs.includes(tab)) {
      throw new Error(`Unknown portal tab: ${tab}`);
    }

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (tab === defaultTab) {
        next.delete("tab");
      } else {
        next.set("tab", tab);
      }
      return next;
    }, { preventScrollReset: true });
  }, [allowedTabs, defaultTab, setSearchParams]);

  return [activeTab, setActiveTab];
}
