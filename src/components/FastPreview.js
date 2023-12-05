import LongText from './LongText'
import * as helper from '../utils/helpers'
import { useState, useRef, useEffect } from 'react';
import * as Svg from './Svg';

const maxTxtSize = 1024 * 8;
const maxHexSize = 1024;

const FastPreview = ({ file, onDownload, onFullscreen, onTitleClick, ...props }) => {

  const [format, setFormat] = useState("");
  const [textPresentation, setTextPresentation] = useState("");

  const maxSize = format === "txt" ? maxTxtSize : maxHexSize;
  const renderSize = Math.min(file.bytes.byteLength, maxSize);
  const scrollDivRef = useRef(null);

  useEffect(() => {
    const fileFormat = helper.testIfText(file.bytes) ? "txt" : "bin";
    setFormat(fileFormat);
    if (fileFormat === "txt") {
      setTextPresentation(helper.toTxtPreview(file.bytes, maxTxtSize));
    }
    if (fileFormat === "bin") {
      setTextPresentation(helper.toHexPreview(file.bytes, maxHexSize));
    }
    scrollDivRef.current.scrollTo({ top: 0, left: 0 });
  }, [file]);

  return (
    <div className='fastpreview' ref={scrollDivRef} {...props} tabIndex={4}>
      <div>
        <LongText style={{ cursor: "pointer" }} onClick={onTitleClick}>{file.name}</LongText>
        <button tabIndex={3} onClick={onDownload} title="download"><Svg.Download /></button>
        <button tabIndex={3} onClick={onFullscreen} title="expand preview"><Svg.FullScreen /></button>
      </div>

      <pre>{textPresentation}</pre>
      <div>
        <LongText>{renderSize.toLocaleString()} of {file.bytes.byteLength.toLocaleString()} bytes shown</LongText>
      </div>
    </div >
  )
};

export default FastPreview;
