import FilterForm from './FilterForm'
import * as helper from '../utils/helpers'
import { useState, useRef, useMemo, useEffect } from 'react';
import ListFooter from './ListFooter';


const PagePreview = ({ file, onBack, onDownload }) => {
  function getFileType(file) {
    if (helper.testIfText(file.bytes)) return "txt";
    if (helper.testIfImage(file.name)) return "img";
    return "bin"
  }

  const fileType = getFileType(file);
  const defaultRenderSize = 1024 * 50;

  const [filter, setFilter] = useState("");
  const [renderSize, setRenderSize] = useState(defaultRenderSize);
  const previewRef = useRef(null);
  const [previewAs, setPreviewAs] = useState(fileType);
  const [linesFound, setLinesFound] = useState(0);
  const [foundSize, setFoundSize] = useState(0);
  const [foundPreviewSize, setFoundPreviewSize] = useState(0);
  const [imgInfo, setImgInfo] = useState({ width: 0, height: 0 });

  //const [previewRawText, setFoundSize] = useState(0);

  const renderHexSize = renderSize / 8;

  useEffect(() => {
  }, [file]);

  const fileUrl = useMemo(
    () => {
      if (previewAs !== "img") return "";
      helper.log("IMG PREVIEW");
      const fullName = file.name;
      const downloadName = fullName.slice(fullName.lastIndexOf("/") + 1);
      const dataView = new DataView(file.bytes.buffer);
      const blob = new Blob([dataView]);
      const downloadUrl = URL.createObjectURL(blob, downloadName);
      helper.log(" IMG PREVIEW DONE");
      return downloadUrl;
    },
    [file, previewAs]
  );

  const fileHex = useMemo(
    () => {
      if (previewAs !== "bin") return "N/A";
      helper.log("HEX PREVIEW");
      const hex = helper.toHexPreview(file.bytes, renderHexSize);
      helper.log(" HEX PREVIEW DONE");
      return hex;
    },
    [file, renderSize, previewAs]
  );

  function handleShowMore(e) {
    e.preventDefault();
    setRenderSize(renderSize + defaultRenderSize);
  }

  function handlePreviewAs(e, format) {
    e.preventDefault();
    setPreviewAs(format);
    setRenderSize(defaultRenderSize);
    previewRef.current.scrollTo({ top: 0, left: 0 });
  }

  const fileTextFiltered = useMemo(
    () => {
      if (previewAs !== "txt") return "N/A";
      if (filter.trim() === "") {
        setFoundSize(file.bytes.byteLength);
        setFoundPreviewSize(Math.min(renderSize, file.bytes.byteLength));
        return helper.toTxtPreview(file.bytes, renderSize);
      }

      helper.log("TEXT PREVIEW");
      const enc = new TextDecoder("utf-8");
      const arr = file.bytes.slice(0, 1024 * 1024 * 30);//e.g. max 30Mb
      const fullText = enc.decode(arr);
      const lines = fullText.split("\n");
      //const f = filter.toUpperCase();
      const filters = filter.toUpperCase().split(" ");
      let fullTextFiltered = "";
      let occurrence = 0;
      let resLen = 0;
      let resPreviewLen = 0;
      lines.map((line, index) => {

        if (!helper.isTextMatchFilters(line, filters)) return;

        resLen += line.length + 1;
        if (resLen <= renderSize) {
          line = line.slice(0, -(resLen - renderSize));
          resPreviewLen += line.length + 1;
          fullTextFiltered += ("00000000" + (index + 1)).slice(-8);
          fullTextFiltered += " | ";
          fullTextFiltered += line;
          fullTextFiltered += "\n";
        }
        occurrence++;
      });
      setLinesFound(occurrence);
      setFoundSize(resLen - 1);
      setFoundPreviewSize(resPreviewLen - 1);

      helper.log(" TEXT PREVIEW DONE");
      return fullTextFiltered;
    },
    [file, filter, renderSize, previewAs]
  );

  function handleFilter(filter) {
    setRenderSize(defaultRenderSize);
    setFilter(filter);
  }

  function handleTitleClick(e) {
    e.preventDefault();
    previewRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function handleImageLoad(e) {
    //console.log(e.target.naturalHeight, e.target.naturalWidth)
    setImgInfo({ width: e.target.naturalWidth, height: e.target.naturalHeight, error: false });
  }
  function handleImageError(e) {
    setImgInfo({ width: "???", height: "???", error: true });

  }

  return (
    <div className='page'>
      <div className='title2'>
        <button onClick={onBack}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M360-240 120-480l240-240 56 56-144 144h568v80H272l144 144-56 56Z" /></svg>
        </button>
        <div className='main'><span onMouseDown={handleTitleClick} style={{ cursor: "pointer" }}>{file.name}</span></div>
        <div>
          <button onClick={(e) => handlePreviewAs(e, "txt")} className={previewAs === "txt" ? 'selected' : ''}>txt</button>
          <button onClick={(e) => handlePreviewAs(e, "bin")} className={previewAs === "bin" ? 'selected' : ''}>bin</button>
          <button onClick={(e) => handlePreviewAs(e, "img")} className={previewAs === "img" ? 'selected' : ''}>img</button>
        </div>
        <button onClick={() => onDownload(file)}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" /></svg>
        </button>

      </div>

      <div className='preview' ref={previewRef}>
        {(previewAs === "txt") && (
          <FilterForm filter={filter} onChange={handleFilter} key={file.name}>
            {filter.trim() === "" && <>{helper.sizeToString(file.bytes.byteLength)}</>}
            {filter.trim() !== "" && <>{linesFound.toLocaleString()} lines</>}
          </FilterForm>)}

        {(previewAs === "img") && (<img src={fileUrl} onLoad={handleImageLoad} onError={handleImageError} />)}
        {(previewAs === "txt") && <pre>{fileTextFiltered}</pre>}
        {(previewAs === "bin") && <pre>{fileHex}</pre>}

        {(previewAs === "bin") && (
          <ListFooter
            current={Math.min(renderHexSize, file.bytes.byteLength)}
            total={file.bytes.byteLength} unit={"byte"}
            onMore={handleShowMore} />
        )}
        {(previewAs === "txt") && (
          <ListFooter
            current={Math.min(renderSize, foundPreviewSize)}
            total={foundSize} unit={"byte"}
            onMore={handleShowMore} />
        )}

        {(previewAs === "img") && (
          <div className='infopanel'>
            <div className='main'>
              {(!imgInfo.error) && <span className='main'>original size: {imgInfo.width} by {imgInfo.height} pixels</span>}
              {(imgInfo.error) && <span className='main'>image error, not an image?</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagePreview;
