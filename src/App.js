import PageStart from './components/PageStart'
import PageLoading from './components/PageLoading'
import PageArchive from './components/PageArchive'
import Credits from './components/Credits'
import { useState } from 'react';
import { unarchive, flatFiles, FileInfo } from './utils/unarchiver'

function App() {

  const PAGE_START = "PAGE_START";
  const PAGE_LOADING = "PAGE_LOADING";
  const PAGE_ARCHIVE = "PAGE_ARCHIVE";

  const [appState, setAppState] = useState(PAGE_START);
  const [files, setFiles] = useState([]);
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
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let rootFile = FileInfo("", bytes);
    await unarchive(rootFile, onProgress);
    let allfiles = rootFile.children === null ? [] : flatFiles(rootFile);
    allfiles.sort(function (a, b) { return a.name.localeCompare(b.name); })
    setFiles(allfiles);
    setAppState(PAGE_ARCHIVE);
    console.log(allfiles);
  }

  return (
    <div className="app">
      {appState === PAGE_START && (<PageStart onFileSelected={handleFileSelected} />)}
      {appState === PAGE_LOADING && (<PageLoading name={archiveName} log={loadingLog} />)}
      {appState === PAGE_ARCHIVE && (<PageArchive name={archiveName} files={files} />)}
      {appState !== PAGE_ARCHIVE && (<Credits />)}
    </div>)
}

export default App;
