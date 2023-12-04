import PageStart from './components/PageStart'
import PageLoading from './components/PageLoading'
import PageArchive from './components/PageArchive'
import Credits from './components/Credits'
import { useEffect, useState } from 'react';
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
  const [loadingLogs, setLoadingLogs] = useState([]);

  useEffect(() => {
    window.history.replaceState(PAGE_START, "");
    window.onpopstate = function (e) {
      if (e.state === PAGE_START) {
        setAppState(PAGE_START);
      }
      if (e.state === PAGE_ARCHIVE) {
        setAppState(PAGE_ARCHIVE);
      }
      if (e.state === PAGE_PREVIEW) {
        setAppState(PAGE_PREVIEW);
      }
    }
  }, [])

  let logs = [];
  function onProgress(msg) {
    logs.push(msg);
    logs = logs.slice(-10);
    setLoadingLogs(logs);
  }

  async function handleFileSelected(file) {
    setAppState(PAGE_LOADING, null);
    setArchiveName(file.name);
    onProgress("reading " + file.name);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let rootFile = FileInfo("", bytes);
      await unarchive(rootFile, onProgress);
      let allfiles = rootFile.children === null ? [] : flatFiles(rootFile);
      allfiles.sort(function (a, b) { return a.name.localeCompare(b.name); })
      if (allfiles.length === 0) {
        rootFile.name = file.name;
        allfiles = [rootFile];
      }
      setFiles(allfiles);
      setAppState(PAGE_ARCHIVE);
      window.history.pushState(PAGE_ARCHIVE, null);
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
    window.history.pushState(PAGE_PREVIEW, null);
    setPreviewFile(file);
    setAppState(PAGE_PREVIEW);
  }

  function handleBack() {
    setAppState(PAGE_ARCHIVE);
    window.history.back();
  }

  return (
    <div className={"app " + appState}>
      {appState === PAGE_START && (<PageStart onFileSelected={handleFileSelected} />)}
      {appState === PAGE_LOADING && (<PageLoading name={archiveName} logs={loadingLogs} />)}
      {(appState === PAGE_ARCHIVE || appState === PAGE_PREVIEW) && (<PageArchive onDownload={handleDownload} onFullscreen={handleFullscreen} name={archiveName} files={files} />)}
      {appState === PAGE_PREVIEW && (<PagePreview onBack={handleBack} onDownload={handleDownload} file={previewFile} />)}
      {appState !== PAGE_ARCHIVE && appState !== PAGE_PREVIEW && (<Credits />)}
    </div>)
}

export default App;
