import { useRef, useEffect, useState } from "react";
import styles from "./styles.module.css";
import { FadeOutOnScrollProps } from "../types/types";

export const FaderOnScroll: React.FC<FadeOutOnScrollProps> = ({ children }) => {
  const domRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState({
    opacity: 1,
    transform: "scale(1)",
    "z-index": "-1",
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const scale = entry.intersectionRatio;
          setStyle({
            opacity: scale,
            transform: `scale(${0.9 + scale * 0.1})`,
            "z-index": "-1",
          });
        });
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i * 0.01),
      }
    );

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.fadeOutSection} style={style} ref={domRef}>
      {children}
    </div>
  );
};
