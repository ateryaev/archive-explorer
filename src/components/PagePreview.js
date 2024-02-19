import FilterForm from './FilterForm'
import * as helper from '../utils/helpers'
import { useState, useRef, useMemo, useEffect } from 'react';
import ListFooter from './ListFooter';
import LongText from './LongText';
import * as Svg from './Svg';

const defaultRenderSize = 1024 * 50;

const PagePreview = ({ file, onBack, onDownload }) => {
  function getFileType(file) {
    if (helper.testIfText(file.bytes)) return "txt";
    if (helper.testIfImage(file.name)) return "img";
    return "bin"
  }
  const fileType = getFileType(file);
  const [filter, setFilter] = useState("");
  const [renderSize, setRenderSize] = useState(defaultRenderSize);
  const renderHexSize = renderSize / 8;
  const previewRef = useRef(null);
  const [previewAs, setPreviewAs] = useState(fileType);
  const [linesFound, setLinesFound] = useState(0);
  const [foundSize, setFoundSize] = useState(0);
  const [foundPreviewSize, setFoundPreviewSize] = useState(0);
  const [imgInfo, setImgInfo] = useState({ width: 0, height: 0 });

  useEffect(() => {
  }, [file]);

  const fileUrl = useMemo(
    () => {
      if (previewAs !== "img") return "";
      const fullName = file.name;
      const downloadName = fullName.slice(fullName.lastIndexOf("/") + 1);
      const dataView = new DataView(file.bytes.buffer);
      const blob = new Blob([dataView]);
      const downloadUrl = URL.createObjectURL(blob, downloadName);
      return downloadUrl;
    },
    [file, previewAs]
  );

  const fileHex = useMemo(
    () => {
      if (previewAs !== "bin") return "N/A";
      const hex = helper.toHexPreview(file.bytes, renderHexSize);
      return hex;
    },
    [file, renderHexSize, /*renderSize,*/ previewAs]
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

      const enc = new TextDecoder("utf-8");
      const arr = file.bytes.slice(0, 1024 * 1024 * 50);//e.g. max 50Mb
      const fullText = enc.decode(arr);
      const lines = fullText.split("\n");
      //const filters = filter.toUpperCase().split(" ");
      const filters = helper.filtersFromStr(filter);
      let fullTextFiltered = "";
      let occurrence = 0;
      let resLen = 0;
      let resPreviewLen = 0;
      lines.forEach((line, index) => {
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
    setImgInfo({ width: e.target.naturalWidth, height: e.target.naturalHeight, error: false });
  }
  function handleImageError(e) {
    setImgInfo({ width: "?", height: "?", error: true });
  }

  return (
    <div className='page'>
      <div className='title2'>
        <button onClick={onBack} title="back" tabIndex="1"><Svg.Back /></button>
        <div className='main' style={{ padding: "0.5rem 0" }}>
          <LongText title={file.name} onMouseDown={handleTitleClick} style={{ cursor: "pointer" }}>{file.name}</LongText>
        </div>
        <div title="preview as...">
          <button tabIndex="1" onClick={(e) => handlePreviewAs(e, "txt")} className={previewAs === "txt" ? 'selected' : ''}>txt</button>
          <button tabIndex="1" onClick={(e) => handlePreviewAs(e, "bin")} className={previewAs === "bin" ? 'selected' : ''}>bin</button>
          <button tabIndex="1" onClick={(e) => handlePreviewAs(e, "img")} className={previewAs === "img" ? 'selected' : ''}>img</button>
        </div>
        <button tabIndex="1" onClick={() => onDownload(file)} title="download"><Svg.Download /></button>

      </div>

      <div className='preview' ref={previewRef}>
        {(previewAs === "txt") && (
          <FilterForm filter={filter} onChange={handleFilter} key={file.name} name="pagepreview">
            {filter.trim() === "" && <>{helper.sizeToString(file.bytes.byteLength)}</>}
            {filter.trim() !== "" && <>{linesFound.toLocaleString()} lines</>}
          </FilterForm>)}

        {(previewAs === "img") && (<img alt="" src={fileUrl} onLoad={handleImageLoad} onError={handleImageError} />)}
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
