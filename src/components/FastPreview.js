import * as helper from '../utils/helpers'
import { useState, useRef, useEffect } from 'react';

let scrollTransaction = 0;

const FastPreview = ({ file, onDownload, onFullscreen, onFocus }) => {

  const [format, setFormat] = useState("-unknown-");
  const [textPresentation, setTextPresentation] = useState("-unavailable-");

  const maxTxtSize = 1024 * 8;
  const maxHexSize = 1024;
  const maxSize = format == "txt" ? maxTxtSize : maxHexSize;
  const renderSize = Math.min(file.bytes.byteLength, maxSize);
  const scrollDivRef = useRef(null);
  const scrollNameRef = useRef(null);

  useEffect(() => {
    const fileFormat = helper.testIfText(file.bytes) ? "txt" : "bin";
    setFormat(fileFormat);

    if (fileFormat == "txt") {
      setTextPresentation(helper.toTxtPreview(file.bytes, maxTxtSize));
    }
    if (fileFormat == "bin") {
      setTextPresentation(helper.toHexPreview(file.bytes, maxHexSize));
    }
    scrollDivRef.current.scrollTo({ top: 0, left: 0 });
    scrollNameRef.current.style.textOverflow = "clip";
    scrollNameRef.current.scrollTo({ top: 0, left: 1000 });
    setTimeout(async () => {
      scrollTransaction++;
      const transaction = scrollTransaction;
      await helper.sleep(1000);
      if (!scrollNameRef.current) return;
      if (transaction == scrollTransaction) scrollNameRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      await helper.sleep(500);
      if (!scrollNameRef.current) return;
      if (transaction == scrollTransaction) scrollNameRef.current.style.textOverflow = "ellipsis";
    }, 0);

  }, [file]);

  function handleNameOver(e) {
    scrollTransaction++;
    scrollNameRef.current.style.textOverflow = "clip";
    scrollNameRef.current.scrollTo({ top: 0, left: 1000, behavior: 'smooth' });
  }

  async function handleNameLeave(e) {
    const transaction = scrollTransaction;
    scrollNameRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    await helper.sleep(500);
    if (!scrollNameRef.current) return;
    if (transaction == scrollTransaction) scrollNameRef.current.style.textOverflow = "ellipsis";
  }

  return (
    <div className='fastpreview' ref={scrollDivRef} onFocus={onFocus}>
      <div>
        <span ref={scrollNameRef}
          onMouseLeave={handleNameLeave}
          onMouseOver={handleNameOver}
        >{file.name}</span>
        <button onClick={onDownload} title="download"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" /></svg></button>
        <button onClick={onFullscreen} title="expand preview"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z" /></svg></button>
      </div>
      <pre>
        {textPresentation}
      </pre>
      <div>
        <span>{renderSize.toLocaleString()} of {file.bytes.byteLength.toLocaleString()} bytes shown</span>
      </div>
    </div>
  )
};

export default FastPreview;
