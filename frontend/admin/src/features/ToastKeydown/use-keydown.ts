import React from "react";

export const useKeydown = (
  key: string,
  callback: (event: KeyboardEvent) => void
) => {
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === key) {
        callback(event);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, callback]);
};
