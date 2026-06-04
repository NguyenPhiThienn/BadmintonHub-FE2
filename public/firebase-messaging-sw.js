importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// We only need the messagingSenderId for the service worker to receive push messages
firebase.initializeApp({
  apiKey: "AIzaSyBtENfeD8hP", // Placeholder or you can leave it empty, SW mainly needs projectId/messagingSenderId
  projectId: "badmintonhub-4c5a2",
  messagingSenderId: "705948680115",
  appId: "1:705948680115:web:..."
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/images/primary-logo.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
