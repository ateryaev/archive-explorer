import ArchiveTitle from './ArchiveTitle'
import FilterForm from './FilterForm'
import * as helper from '../utils/helpers'
import { useState, useRef, useMemo, useEffect } from 'react';
import ListFooter from './ListFooter';

const PagePreview = ({ file, onBack, onDownload }) => {

  const fileType = "bin";

  const [filter, setFilter] = useState("");
  const defaultRenderSize = 1024 * 50;
  const [renderSize, setRenderSize] = useState(defaultRenderSize);
  const previewRef = useRef(null);
  const [previewAs, setPreviewAs] = useState(fileType);
  const [linesFound, setLinesFound] = useState(0);
  const [foundSize, setFoundSize] = useState(0);
  const renderHexSize = renderSize / 8;

  

  useEffect(() => {
    helper.log("USE PREVIEW EFFECT")
    // setRenderSize(defaultRenderSize);
    // setFilter("");
    // previewRef.current.scrollTo({ top: 0, left: 0 });
    // if (isImage) setPreviewAs("img");
    // else if (isText) setPreviewAs("txt2");
    // else setPreviewAs("bin");
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
      const imageExts = " ico png jpg gif jpe bmp tiff jpeg"
      const ext = file.name.slice(file.name.lastIndexOf(".") + 1);
      return ext.length > 2 && imageExts.indexOf(" " + ext) >= 0;
    },
    [file]
  );

  const fileUrl = useMemo(
    () => {
      helper.log("fileUrl start");
      helper.log("previewAs: " + previewAs);
      const fullName = file.name;
      const downloadName = fullName.slice(fullName.lastIndexOf("/") + 1);
      const dataView = new DataView(file.bytes.buffer);
      const blob = new Blob([dataView]);
      const downloadUrl = URL.createObjectURL(blob, downloadName);
      helper.log("fileUrl end");
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
      helper.log("fileHex start");
      helper.log("previewAs: " + previewAs);
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
      helper.log("fileHex end");
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

  function handlePreviewAs(e, format) {
    e.preventDefault();
    setPreviewAs(format);
  }

  const fileTextFiltered = useMemo(
    () => {
      helper.log("fileTextFiltered start: " + file.name);
      helper.log("size: " + file.bytes.byteLength);
      helper.log("previewAs: " + previewAs);
      const enc = new TextDecoder("utf-8");
      const arr = file.bytes;//.slice(0, 1024*10);//e.g. max 10Mb
      helper.log("slice");
      const fullText = enc.decode(arr);
      helper.log("decode");
      const lines = fullText.split("\n");
      helper.log("split");
      const f = filter.toUpperCase();
      let fullTextFiltered = "";
      let occurrence = 0;
      let resLen = 0;
      lines.map((line, index) => {
        if (line.toUpperCase().indexOf(f) == -1) return;
        //if (line.indexOf(f) == -1) return;
        resLen += line.length + 1;
        if (resLen <= renderSize) {
          line = line.slice(0, -(resLen - renderSize));
          fullTextFiltered += ("00000000" + (index + 1)).slice(-8);
          fullTextFiltered += " | ";
          fullTextFiltered += line;
          fullTextFiltered += "\n";
        }
        occurrence++;
      });
      setLinesFound(occurrence);
      setFoundSize(resLen-1);

      helper.log("fileTextFiltered end");
      return fullTextFiltered;
    },
    [file, filter, renderSize]
  );

  function handleFilter(filter) {
    setRenderSize(defaultRenderSize);
    setFilter(filter);
  }
  return (
    <div className='page'>
      <div className='infopanel title'>
          <div><button onClick={onBack}>
<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M360-240 120-480l240-240 56 56-144 144h568v80H272l144 144-56 56Z"/></svg></button></div>
          <div className='main'><span>{file.name}</span></div>
          <div>
            <button onClick={(e) => handlePreviewAs(e, "txt")} className={previewAs === "txt" ? 'selected' : ''}>txt</button>
            <button onClick={(e) => handlePreviewAs(e, "bin")} className={previewAs === "bin" ? 'selected' : ''}>bin</button>
            <button onClick={(e) => handlePreviewAs(e, "img")} className={previewAs === "img" ? 'selected' : ''}>img</button>
          </div>
          <div>
          <button onClick={handleDownload}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" /></svg>
            </button>
            </div>
      </div>

      <div className='filelist' ref={previewRef}>
        {(previewAs === "txt") && (
          <FilterForm filter={filter} onChange={handleFilter} key={file.name}>
            {linesFound.toLocaleString()} lines
          </FilterForm>)}

        {(previewAs === "img") && (<img src={fileUrl} />)}
        {(previewAs === "txt") && <pre>{fileTextFiltered}</pre>}
        {(previewAs === "bin") && <pre>{fileHex}</pre>}

        {(previewAs === "bin") && (
          <ListFooter 
            current={Math.min(renderHexSize, file.bytes.byteLength)} 
            total={file.bytes.byteLength} unit={"byte"}
            onMore={handleShowMore}/>
        )}
        {(previewAs === "txt") && (
          <ListFooter 
            current={Math.min(renderSize, file.bytes.byteLength)} 
            total={foundSize} unit={"byte"}
            onMore={handleShowMore}/>
        )}
      </div>
    </div>
  );
};

export default PagePreview;
