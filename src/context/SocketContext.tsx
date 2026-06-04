"use client";

import { createContext, useContext, ReactNode, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@/context/useUserContext";

interface SocketContextType {
  isConnected: boolean;
  joinRoom: (userId: string) => void;
  leaveRoom: (userId: string) => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => () => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  joinRoom: () => {},
  leaveRoom: () => {},
  emit: () => {},
  on: () => () => {},
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Lấy URL socket từ API URL cấu hình
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://BadmintonHubbe.onrender.com/api/v1";
    const socketUrl = apiUrl.replace(/\/api\/v1\/?$/, "");

    console.log("Connecting to socket server:", socketUrl);
    const socket = io(socketUrl, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected, ID:", socket.id);
      if (user?._id) {
        socket.emit("join", { userId: user._id });
        console.log(`Joined room user:${user._id}`);
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    return () => {
      if (socket) {
        if (user?._id) {
          socket.emit("leave", { userId: user._id });
        }
        socket.disconnect();
      }
    };
  }, [user?._id]);

  const joinRoom = (userId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("join", { userId });
    }
  };

  const leaveRoom = (userId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("leave", { userId });
    }
  };

  const emit = (event: string, data?: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        joinRoom,
        leaveRoom,
        emit,
        on,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
