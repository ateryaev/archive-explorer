import { useEffect, useRef } from 'react';

const LongText = ({ children, ...props }) => {
  const spanRef = useRef(null);

  useEffect(() => {
    spanRef.current.style.textOverflow = "clip";
    spanRef.current.scrollTo({ top: 0, left: spanRef.current.scrollWidth });
    spanRef.current.isRemounting = true;
    let ti = null;
    let to = setTimeout(() => {
      if (!spanRef.current || spanRef.current.isMouseOnIt) {
        if (spanRef.current) spanRef.current.isRemounting = false;
        return;
      }
      spanRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      ti = setInterval(() => {
        if (!spanRef.current || spanRef.current.isMouseOnIt) {
          clearInterval(ti);
          if (spanRef.current) spanRef.current.isRemounting = false;
          return;
        }
        const isDisplayed = spanRef.current.getBoundingClientRect().width > 0;
        if (isDisplayed) {
          spanRef.current.scrollLeft = 0;
          spanRef.current.scrollTop = 0;
          spanRef.current.style.textOverflow = "ellipsis";
          spanRef.current.isRemounting = false;
          clearInterval(ti);
        }
      }, 1000);
    }, 1000);
    return () => {
      clearTimeout(to);
      clearInterval(ti);
    }
  }, [children]);

  function handleOver() {
    spanRef.current.isMouseOnIt = true;
    spanRef.current.style.textOverflow = "clip";
    spanRef.current.scrollTo({ top: 0, left: spanRef.current.scrollWidth, behavior: 'smooth' });
  }

  async function handleLeave() {

    spanRef.current.isMouseOnIt = false;
    spanRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    let ti = setInterval(() => {
      if (!spanRef.current || spanRef.current.isMouseOnIt || spanRef.current.isRemounting) {
        clearInterval(ti);
        if (spanRef.current) spanRef.current.isRemounting = false;
        return;
      }
      const isDisplayed = spanRef.current.getBoundingClientRect().width > 0;
      if (isDisplayed) {
        spanRef.current.scrollLeft = 0;
        spanRef.current.scrollTop = 0;
        spanRef.current.style.textOverflow = "ellipsis";
        spanRef.current.isRemounting = false;
        clearInterval(ti);
      }
    }, 1000);
  }

  return (
    <span ref={spanRef} {...props} onMouseOver={handleOver} onMouseLeave={handleLeave}>
      {props.logo && <>{props.logo}</>}
      {children}
    </span>
  );
};

export default LongText;
