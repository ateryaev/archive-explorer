import { useState, useEffect, useRef } from 'react';

const PageLoading = ({ name, log }) => {
  const logsRef = useRef(null);
  const [logs, setLogs] = useState(["line1", "line2", "line2", "line2", "line2", "line2", "line2", "line2", "linelast"]);
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
    let newLogs = logs.slice(0);
    newLogs.push(log);
    setLogs(newLogs);
    let to = setTimeout(() => { logsRef.current.scrollTo({ top: logsRef.current.scrollHeight, behavior: 'smooth' }); }, 0);
    return () => {
      clearTimeout(to);
    };
  }, [log]);

  return (
    <div className='dialog'>
      <div>Loading {spinner}</div>
      <div>testarchive.zip{name}</div>
      <div></div>
      <pre className='logs' ref={logsRef}>
        {logs.map((line, index) => (
          <>{index == logs.length - 1 ? "-" : "+"} {line + "\n"}</>
        ))}
      </pre>
    </div>
  );
};

export default PageLoading;
