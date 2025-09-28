import { useState, useEffect } from 'react';

/**
 * Custom hook for hash-based tab navigation
 * Provides URL persistence and browser navigation support for tabbed interfaces
 * 
 * @param validTabs - Array of valid tab values
 * @param defaultTab - Default tab to show if no hash or invalid hash
 * @returns Object with activeTab state and handleTabChange function
 */
export const useHashNavigation = (validTabs: string[], defaultTab: string) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Initialize tab from URL hash on component mount
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    
    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash);
    } else if (!hash) {
      setActiveTab(defaultTab);
    }
  }, [validTabs, defaultTab]);

  // Handle tab change with URL update
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.pushState(null, '', `${window.location.pathname}#${value}`);
  };

  return {
    activeTab,
    handleTabChange
  };
};