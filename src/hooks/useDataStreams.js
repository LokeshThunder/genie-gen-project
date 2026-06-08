import { useState, useEffect, useRef } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { NotificationService } from '../services/notificationService';

/**
 * Sets up all Firestore real-time streams (jobs, applications, attendance).
 * Extracted from App.jsx. Only activates when the user is logged in.
 * Streams are opened after a short delay to allow the UI to paint first.
 */
export function useDataStreams({ isLoggedIn, user, userRole }) {
  const [adminJobs, setAdminJobs]       = useState([]);
  const [applications, setApplications] = useState([]);
  const [attendance, setAttendance]     = useState([]);
  const [timeOffRequests, setTimeOffRequests] = useState([]);
  const prevAppsRef = useRef([]);
  // Ref to hold unsub functions across the setTimeout boundary
  const unsubRef = useRef({});

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    // Delay stream setup by 300ms so the UI can paint the home screen first
    // before multiple Firestore connections start competing for bandwidth.
    const startupTimer = setTimeout(() => {
      // Jobs stream — admin sees all, worker sees live only
      const unsubJobs = userRole === 'admin'
        ? FirestoreService.streamJobs(setAdminJobs)
        : FirestoreService.streamLiveJobs(setAdminJobs);

      // Applications stream — with approval notification for workers
      const handleSetApplications = (newApps) => {
        if (userRole === 'worker') {
          newApps.forEach(newApp => {
            const oldApp = prevAppsRef.current.find(a => a.id === newApp.id);
            if (oldApp && oldApp.status !== 'Approved' && newApp.status === 'Approved') {
              NotificationService.showNotification('Application Approved! 🎉', {
                body: `You've been hired for ${newApp.jobTitle || 'a new job'}. Check your Active Jobs!`,
              });
            }
          });
        }
        prevAppsRef.current = newApps;
        setApplications(newApps);
      };

      const unsubApps = userRole === 'admin'
        ? FirestoreService.streamApplications(setApplications)
        : FirestoreService.streamUserApplications(user.uid, handleSetApplications);

      // Attendance stream — only admins need the global view; workers use per-job data
      const unsubAttendance = userRole === 'admin'
        ? FirestoreService.streamAttendance(setAttendance)
        : null;

      // TimeOff stream
      const unsubTimeOff = FirestoreService.streamTimeOffRequests ? FirestoreService.streamTimeOffRequests((requests) => {
        if (userRole === 'admin' || userRole === 'super_admin') {
          setTimeOffRequests(requests);
        } else {
          setTimeOffRequests(requests.filter(r => r.workerId === user.uid));
        }
      }) : null;

      // Store unsub functions in ref so the outer cleanup can reach them
      unsubRef.current = { unsubJobs, unsubApps, unsubAttendance, unsubTimeOff };
    }, 300);

    return () => {
      clearTimeout(startupTimer);
      // Clean up any streams that already opened before unmount
      const { unsubJobs, unsubApps, unsubAttendance, unsubTimeOff } = unsubRef.current;
      if (unsubJobs) unsubJobs();
      if (unsubApps) unsubApps();
      if (unsubAttendance) unsubAttendance();
      if (unsubTimeOff) unsubTimeOff();
      unsubRef.current = {};
    };
  }, [isLoggedIn, user, userRole]);

  return { adminJobs, applications, attendance, timeOffRequests };
}
