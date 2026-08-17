import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const TIMEOUT_DURATION = 20 * 1000;

export function IdleTimer() {
  const { logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);


// function that restarts the countdown whenever move or click
  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    

    // doesn't care which role u have, start countdown 
    if (isAuthenticated) {
      timerRef.current = setTimeout(() => {
        handleTimeout();
      }, TIMEOUT_DURATION);
    }
  };



  //function that handles the logout, redirect, and the "Session Timeout" message.
  const handleTimeout = async () => {
    try {
      await logout();
      setLocation("/");
      toast({
        title: "Session Timeout",
        description: "You have been logged out due to inactivity.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Logout failed during timeout:", error);
    }
  };


  //Defines the "Events" (mousedown, mousemove, keypress, scroll, touchstart, click) that the system listens to.
  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click"
    ];

    const handleActivity = () => resetTimer();

    // Set initial timer
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, logout, setLocation]);

  return null;
}
