import { useState, useId } from 'react';

const PageStart = ({ onFileSelected }) => {

  const id = useId();
  const [dragFileOver, setDragFileOver] = useState(false);

  function handleFile(e) {
    if (e.target.files.length === 0) return;
    const inputFile = e.target.files[0];
    onFileSelected(inputFile);
  }

  function handleClick() {
    document.getElementById(id).click();
  }

  function handleDrop(e) {
    e.preventDefault();
    console.log("File drop in zone");
    console.log(e.dataTransfer.items)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];
      if (item.kind === "file") {
        const file = item.getAsFile();
        onFileSelected(file);
        console.log(file.name);
      }
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];
      if (item.kind === "file") {
        setDragFileOver(true);
      }
    }
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragFileOver(false);
  }

  return (
    <div
      className={dragFileOver ? 'dialog drag' : 'dialog'}
      id="drop_zone"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}>
      <div>
        <input type='file' id={id} onChange={handleFile} style={{ display: "none" }} />
        Drop archive file here.<br />
        Supported formats: *.zip, *.gz, *.xz, *.tar.<br />
        File will be processed localy.
        <br /><br />
      </div>
      <button onClick={handleClick}>open file</button>
    </div>
  );
};

export default PageStart;
