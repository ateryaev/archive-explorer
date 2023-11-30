import { useState, useEffect, useRef, Fragment } from 'react';

const PageLoading = ({ name, log }) => {
  const logsRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [spinner, setSpinner] = useState("...");

  useEffect(() => {
    let counter = 0;
    let ti = setInterval(() => {
      const chars = ["|...", ".|..", "..|.", "...|"];
      counter = (counter + 1) % chars.length;
      setSpinner("[" + chars[counter] + "]");
    }, 200);
    return () => {
      clearInterval(ti);
    }
  }, []);

  useEffect(() => {
    let newLogs = logs.slice(-10);
    newLogs.push(log);
    setLogs(newLogs);
    logsRef.current.scrollTop = 100000;
    setTimeout(() => {
      logsRef.current.scrollTop = 100000;
    }, 0);
  }, [log]);

  return (
    <div className='dialog'>
      <div>Loading {spinner}</div>
      <div>testarchive.zip{name}</div>
      <div></div>
      <pre className='logs' ref={logsRef}>
        {logs.map((line, index) => (
          <Fragment key={index}>{index == logs.length - 1 ? "-" : "+"} {line + "\n"}</Fragment>
        ))}
      </pre>
    </div>
  );
};

export default PageLoading;
