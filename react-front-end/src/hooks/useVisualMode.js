import React, { useState } from "react";

//manages whats displayed eg. form, edit, delete in appointment/index.js ect based on transition
export default function useVisualMode(initial) {
  const [mode, setMode] = useState(initial);
  const [history, setHistory] = useState([initial]);

  function transition(newMode, replace = false) {
    setMode(newMode);
    setHistory(prev => {
      if (replace) {
        prev.pop();
      }
      return [...prev, newMode];
    });
  }

  function back() {
    if (history.length > 1) {
      history.pop();
      setMode(history[history.length - 1]);
    } else {
      setMode(history[0]);
    }
  }

  return { transition, mode, back };
}
