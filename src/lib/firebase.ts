import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axiosClient from "@/api/axios";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA546hAU267gtuA3APRgkFNQES_3Gn2wFY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "eascompany-5a308.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "eascompany-5a308",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "eascompany-5a308.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1017392990528",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1017392990528:web:aa3b6f2003d654a51012a5",
  measurementId: "G-BB6E0BTES5"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
auth.languageCode = 'vi';

export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestForToken = async () => {
  if (!messaging) return null;
  try {
    if (typeof window !== 'undefined' && Notification.permission === 'denied') {
      console.log('Người dùng đã chặn thông báo.');
      return null;
    }
    const currentToken = await getToken(messaging, { 
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY 
    });
    
    if (currentToken) {
      console.log('Firebase Token:', currentToken);
      
      // Send token to backend
      try {
        await axiosClient.post({ url: '/users/fcm-token', data: { token: currentToken } });
        console.log('Token đã được lưu lên server');
      } catch (err) {
        console.error('Lỗi khi lưu token lên server:', err);
      }
      
      return currentToken;
    } else {
      console.log('Chưa cấp quyền hiển thị thông báo.');
      return null;
    }
  } catch (err) {
    console.error('Lỗi khi lấy token:', err);
    return null;
  }
};

export const onMessageListener = (callback: (payload: any) => void) => {
  if (messaging) {
    return onMessage(messaging, (payload) => {
      callback(payload);
    });
  }
  return () => {};
};
