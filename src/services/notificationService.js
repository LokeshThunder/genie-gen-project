export const NotificationService = {
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn("This browser does not support desktop notification");
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  },

  async showNotification(title, options = {}) {
    const hasPermission = await this.requestPermission();
    if (hasPermission) {
      try {
        // We use a service worker registration if available for better mobile support, 
        // otherwise fallback to standard Notification
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if (registration && registration.showNotification) {
            registration.showNotification(title, {
              icon: '/genie-icon.png', // Fallback icon
              badge: '/genie-icon.png',
              vibrate: [200, 100, 200],
              ...options
            });
            return;
          }
        }
        
        new Notification(title, {
          icon: '/genie-icon.png',
          ...options
        });
      } catch (e) {
        console.warn("Failed to show native notification:", e);
      }
    }
  }
};
