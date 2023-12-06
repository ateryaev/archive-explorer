import { useState, useEffect, useRef, Fragment } from 'react';

const PageLoading = ({ name, logs }) => {
  const logsRef = useRef(null);
  const [anime1, setAnime1] = useState("");
  const [anime2, setAnime2] = useState("");
  useEffect(() => {

    let counter = 0;
    let ti = setInterval(() => {
      const anime1frames = ["|....", ".|...", "..|..", "...|.", "....|"];
      const anime2frames = ["\u2014", "\\", "|", "/"];
      counter++;
      setAnime1("[" + anime1frames[counter % anime1frames.length] + "]");
      setAnime2(anime2frames[counter % anime2frames.length]);
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
      <div>Loading {anime1}</div>
      <div>{name}</div>
      <pre className='logs' ref={logsRef}>
        {logs.map((line, index) => (
          <Fragment key={index}>
            {index === logs.length - 1 ? anime2 + " " + line : "+ " + line + " done"}
            {"\n"}
          </Fragment>
        ))}
      </pre>
    </div>
  );
};

export default PageLoading;
