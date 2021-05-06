import { useState, useEffect } from "react";
import { size } from "../../theme";

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export const useTooltipNewLine = () => {
  const { width } = useWindowSize();
  return (769 <= width && width <= 1400);
};

export const useIsMobile = () => {
  const { width } = useWindowSize();
  return width <= size.tablet;
};
