import { useState, useEffect } from 'react';

const PageLoading = ({ name, log }) => {
  const [log1, setLog1] = useState("");
  const [log2, setLog2] = useState("");

  useEffect(() => {
    setLog1(log2);
    setLog2(log);
    return () => { };
  }, [log]);

  return (
    <div className='dialog'>
      <div>Loading <b>.</b><b>.</b><b>.</b><br />{name}<br /></div>
      <div className='logs'>&gt;&nbsp;{log1}<br />&gt;&nbsp;{log2}</div>
    </div>
  );
};

export default PageLoading;
