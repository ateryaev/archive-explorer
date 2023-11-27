import ArchiveTitle from './ArchiveTitle'
import FilterForm from './FilterForm'
import * as helper from '../utils/helpers'
import { useState, useRef, useMemo, useEffect } from 'react';


//setRenderSize
const PagePreview = ({ file, onCloseClick, onExpandClick }) => {
  const [filter, setFilter] = useState("");
  const defaultRenderSize = 1024 * 50;
  const [renderSize, setRenderSize] = useState(defaultRenderSize);
  const imageRef = useRef(null);
  const previewRef = useRef(null);


  const renderHexSize = renderSize / 8;

  useEffect(() => {
    setRenderSize(defaultRenderSize);
    previewRef.current.scrollTo({ top: 0 });
  }, [file]);

  const isText = useMemo(
    () => {
      let numOfBins = 0;
      const checkSize = Math.min(100, file.bytes.byteLength);
      for (let i = 0; i < checkSize; i++) {
        if (!helper.isTextChar(file.bytes[i])) numOfBins++;
      }
      const binRatio = (numOfBins + 1) / (checkSize + 1);
      console.log("binRatio", file.name, binRatio);
      return binRatio < 0.05;
    },
    [file]
  );

  const isImage = useMemo(
    () => {
      const imageExts = " ico png jpg svg gif jpe bmp tiff jpeg"
      const ext = file.name.slice(file.name.lastIndexOf(".") + 1);
      return ext.length > 2 && imageExts.indexOf(" " + ext) >= 0;
    },
    [file]
  );

  const fileUrl = useMemo(
    () => {
      const fullName = file.name;
      const downloadName = fullName.slice(fullName.lastIndexOf("/") + 1);
      const dataView = new DataView(file.bytes.buffer);
      const blob = new Blob([dataView]);
      const downloadUrl = URL.createObjectURL(blob, downloadName);
      return downloadUrl;
    },
    [file]
  );

  const fileText = useMemo(
    () => {
      const enc = new TextDecoder("utf-8");
      const arr = file.bytes.slice(0, renderSize);
      return enc.decode(arr);
    },
    [file, renderSize]
  );

  const fileHex = useMemo(
    () => {
      let str = "";
      let txt = "";
      const len = Math.min(renderHexSize, 16 * Math.ceil(file.bytes.byteLength / 16));

      for (let i = 0; i < len; i++) {

        const outOfBound = i >= file.bytes.byteLength;
        const byte = outOfBound ? 0 : file.bytes[i];
        if (i % 16 == 0) {
          str += ("00000000" + i.toString(16)).slice(-8) + " | ";
        }
        if (i % 16 == 8) str += " ";
        if (!outOfBound) {
          str += ("00" + byte.toString(16)).slice(-2) + " ";
          txt += helper.isSymbolChar(byte) ? String.fromCharCode(byte) : ".";
        } else {
          str += "   ";
          txt += " ";
        }

        if (i % 16 == 15) {
          str += "| " + txt + "\n";
          txt = "";
        }
      }
      return str;

    },
    [file, renderSize]
  );

  function handleDownload(e) {
    e.preventDefault();
    const fullName = file.name;
    const downloadName = fullName.slice(fullName.lastIndexOf("/") + 1);
    const dataView = new DataView(file.bytes.buffer);
    const blob = new Blob([dataView]);
    helper.Download(blob, downloadName);
    return false;
  }

  function handleShowMore(e) {
    e.preventDefault();
    setRenderSize(renderSize + defaultRenderSize);
  }

  return (
    <div className='page archive preview'>
      <div className='title'>
        <div>{file.name}</div>
        <div>
          <button title='download file' onClick={handleDownload}>&nbsp;download&nbsp;</button>
          <button title='expand view' onClick={onExpandClick}>&nbsp;&plusmn;&nbsp;</button>
          <button title='close preview' onClick={onCloseClick}>&nbsp;&times;&nbsp;</button>
        </div>
      </div>
      {(isText && false) && <FilterForm />}

      <div className='filelist' ref={previewRef}>

        {isImage && (<div className='fileRow info'>
          <div>Image format</div>
          <div>{helper.sizeToBytesString(file.bytes.byteLength)}</div>
        </div>)}

        {isImage && (<img src={fileUrl} />)}

        {isText && (<div className='fileRow info'>
          <div>Text format, {"no filters"}</div>
          <div>{helper.sizeToBytesString(file.bytes.byteLength)}</div>
        </div>)}

        {isText && <pre>{fileText}</pre>}

        {isText && (<div className='fileRow info'>
          {(file.bytes.byteLength > renderSize) && (<div>
            showing only first&nbsp;
            {helper.sizeToString(Math.min(renderSize, file.bytes.byteLength))}
            &nbsp;of&nbsp;
            {helper.sizeToString(file.bytes.byteLength)}
          </div>)}
          {(file.bytes.byteLength <= renderSize) && (<div>
            all {helper.sizeToString(file.bytes.byteLength)} shown
          </div>)}

          {(file.bytes.byteLength > renderSize) && <div><a href="#" onClick={(e) => handleShowMore(e)}>show more</a></div>}
        </div>)}


        {!isText && (<div className='fileRow info'>
          <div>Binary data</div>
          <div>{helper.sizeToBytesString(file.bytes.byteLength)}</div>
        </div>)}

        {!isText && (<pre>{fileHex}</pre>)}

        {!isText && (<div className='fileRow info'>
          <div>
            showing only first&nbsp;
            {helper.sizeToString(Math.min(renderHexSize, file.bytes.byteLength))}
            &nbsp;of&nbsp;
            {helper.sizeToString(file.bytes.byteLength)}
          </div>
          <div><a onClick={(e) => handleShowMore(e)}>show more</a></div>
        </div>)}


      </div>

    </div>
  );
};

export default PagePreview;
