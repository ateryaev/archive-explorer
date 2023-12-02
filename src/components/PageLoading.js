import { useState, useEffect, useRef, Fragment } from 'react';

const PageLoading = ({ name, logs }) => {
  const logsRef = useRef(null);
  const [spinner, setSpinner] = useState("...");

  useEffect(() => {
    let counter = 0;
    let ti = setInterval(() => {
      const chars = ["|....", ".|...", "..|..", "...|.", "....|"];
      counter = (counter + 1) % chars.length;
      setSpinner("[" + chars[counter] + "]");
    }, 150);
    return () => {
      clearInterval(ti);
    }
  }, []);

  useEffect(() => {
    logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className='dialog'>
      <div>Loading {spinner}</div>
      <div>{name}</div>
      <pre className='logs' ref={logsRef}>
        {logs.map((line, index) => (
          <Fragment key={index}>{index === logs.length - 1 ? "-" : "+"} {line + "\n"}</Fragment>
        ))}
      </pre>
    </div>
  );
};

export default PageLoading;
