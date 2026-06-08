import { useState } from 'react';

/**
 * Manages tab-based navigation state.
 * Extracted from App.jsx.
 */
export function useNavigation(initialTab = 'Home') {
  const [activeTab, setActiveTab]       = useState(initialTab);
  const [screenParams, setScreenParams] = useState({});

  const navigateTo = (screen, params = {}) => {
    setScreenParams(params);
    setActiveTab(screen);
  };

  // Expose navigateTo globally for E2E tests
  if (typeof window !== 'undefined' && window.IS_E2E_TEST) {
    window.navigateTo = navigateTo;
  }

  return { activeTab, screenParams, navigateTo };
}
