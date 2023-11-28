import ArchiveTitle from './ArchiveTitle'
import FilterForm from './FilterForm'
import * as helper from '../utils/helpers'
import { useState, useRef, useMemo, useEffect } from 'react';

const PagePreview = ({ file, onCloseClick, onExpandClick }) => {
  const [filter, setFilter] = useState("");
  const defaultRenderSize = 1024 * 50;
  const [renderSize, setRenderSize] = useState(defaultRenderSize);
  const previewRef = useRef(null);
  const [previewAs, setPreviewAs] = useState("txt");
  const [linesFound, setLinesFound] = useState(0);
  const [foundSize, setFoundSize] = useState(0);



  const renderHexSize = renderSize / 8;

  useEffect(() => {
    setRenderSize(defaultRenderSize);
    setFilter("");
    previewRef.current.scrollTo({ top: 0 });
    if (isImage) setPreviewAs("img");
    else if (isText) setPreviewAs("txt");
    else setPreviewAs("bin");
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

  function handlePreviewAs(e, format) {
    e.preventDefault();
    setPreviewAs(format);
  }

  const fileTextFiltered = useMemo(
    () => {
      const enc = new TextDecoder("utf-8");
      const arr = file.bytes;//.slice(0, 1024*1024*10);//e.g. max 10Mb
      const fullText = enc.decode(arr);
      const lines = fullText.split("\n");
      const f = filter.toUpperCase();
      let fullTextFiltered = "";
      let occurrence = 0;
      let resLen = 0;
      lines.map((line, index) => {
        if (line.toUpperCase().indexOf(f) == -1) return;
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
      setFoundSize(resLen);

      return fullTextFiltered;
    },
    [file, filter, renderSize]
  );

  function handleFilter(filter) {
    setRenderSize(defaultRenderSize);
    setFilter(filter);
  }
  return (
    <div className='page archive preview'>


      <div className='filelist' ref={previewRef}>
        <div className='infopanel'>
          <div className='main'>
            <span className='main'>{helper.extractFileName(file.name)}</span>
            <button onClick={handleDownload}>download</button>
          </div>
          <div>
            <button onClick={(e) => handlePreviewAs(e, "txt")} className={previewAs === "txt" ? 'selected' : ''}>txt</button>
            <button onClick={(e) => handlePreviewAs(e, "bin")} className={previewAs === "bin" ? 'selected' : ''}>bin</button>
            <button onClick={(e) => handlePreviewAs(e, "img")} className={previewAs === "img" ? 'selected' : ''}>img</button>
          </div>
          <div>
            <button onClick={(e) => onExpandClick(e)}>expand</button>
          </div>
        </div>

        {(previewAs === "txt") && (
          <FilterForm filter={filter} onChange={handleFilter} key={file.name}>
            {linesFound} lines
          </FilterForm>)}

        {(previewAs === "img") && (<img src={fileUrl} />)}
        {(previewAs === "txt") && <pre>{fileTextFiltered}</pre>}
        {(previewAs === "bin") && <pre>{fileHex}</pre>}

        {(previewAs === "txt") && (<div className='filter info'>
          {(foundSize > renderSize) && (<div>
            showing only first&nbsp;
            {helper.sizeToString(Math.min(renderSize, file.bytes.byteLength))}
            &nbsp;of filtered content&nbsp;
            {helper.sizeToString(foundSize)}
          </div>)}
          {(foundSize <= renderSize) && (<div>
            all {helper.sizeToString(foundSize)} of filtered content shown
          </div>)}

          {(foundSize > renderSize) && <button onClick={(e) => handleShowMore(e)}>show more</button>}
        </div>)}

        {(previewAs === "bin") && (
          <div className='infopanel'>
            <div className='main'>
              <span className='main'>showing only first&nbsp;
                {helper.sizeToString(Math.min(renderHexSize, file.bytes.byteLength))}
                &nbsp;of&nbsp;
                {helper.sizeToString(file.bytes.byteLength)}</span>

              <button onClick={(e) => handleShowMore(e)}>show more</button>
            </div>
          </div>
        )}


      </div>

    </div>
  );
};

export default PagePreview;
