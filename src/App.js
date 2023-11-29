import PageStart from './components/PageStart'
import PageLoading from './components/PageLoading'
import PageArchive from './components/PageArchive'
import Credits from './components/Credits'
import { useState } from 'react';
import { unarchive, flatFiles, FileInfo } from './utils/unarchiver'
import * as helper from './utils/helpers'
import PagePreview from './components/PagePreview';

function App() {

  const PAGE_START = "PAGE_START";
  const PAGE_LOADING = "PAGE_LOADING";
  const PAGE_ARCHIVE = "PAGE_ARCHIVE";
  const PAGE_PREVIEW = "PAGE_PREVIEW";

  const [appState, setAppState] = useState(PAGE_START);
  const [files, setFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [archiveName, setArchiveName] = useState("");
  const [loadingLog, setLoadingLog] = useState("");

  function onProgress(msg) {
    console.log(msg);
    setLoadingLog(msg);
  }

  async function handleFileSelected(file) {
    setAppState(PAGE_LOADING);
    setArchiveName(file.name);
    setLoadingLog("reading " + file.name);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let rootFile = FileInfo("", bytes);
      await unarchive(rootFile, onProgress);
      let allfiles = rootFile.children === null ? [] : flatFiles(rootFile);
      allfiles.sort(function (a, b) { return a.name.localeCompare(b.name); })
      setFiles(allfiles);
      setAppState(PAGE_ARCHIVE);
      console.log(allfiles);
    } catch (e) {
      console.log(e);
      setAppState(PAGE_START);
    }
  }
  function handleDownload(file) {
    console.log("handleDownload", file);
    helper.Download(file.bytes, file.name);
  }
  function handleFullscreen(file) {
    console.log("handleFullscreen");
    setPreviewFile(file);
    setAppState(PAGE_PREVIEW);
  }
  function handleBack() {
    setAppState(PAGE_ARCHIVE);
  }

  return (
    <div className="app">
      {appState === PAGE_START && (<PageStart onFileSelected={handleFileSelected} />)}
      {appState === PAGE_LOADING && (<PageLoading name={archiveName} log={loadingLog} />)}
      {appState === PAGE_ARCHIVE && (<PageArchive key="archive" onDownload={handleDownload} onFullscreen={handleFullscreen} name={archiveName} files={files} />)}
      {appState === PAGE_PREVIEW && (<PagePreview onBack={handleBack} file={previewFile} />)}
      {appState !== PAGE_ARCHIVE && appState !== PAGE_PREVIEW && (<Credits />)}
    </div>)
}

export default App;
