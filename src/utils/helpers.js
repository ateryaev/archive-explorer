
export function isSymbolChar(byte) {
  return (byte >= 32 && byte <= 126);
}

export function isTextChar(byte) {
  return isSymbolChar(byte) || (byte == 10) || (byte == 13) || (byte == 9);
}

export function sizeToString(filesize) {
  const unitNames = [' bytes', ' KB', ' MB', ' GB', ' TB'];
  let unitCount = filesize;
  let unitIndex = 0;

  while (unitCount > 1024) {
    unitCount /= 1024;
    unitIndex++;
  }
  let decimals = 1;

  if (unitCount.toFixed(1).slice(-2) == ".0") decimals = 0;

  return unitCount.toFixed(decimals) + unitNames[unitIndex];
}

export function sizeToBytesString(filesize) {
  let sizeStr = filesize + "";
  let newStr = "";

  while (sizeStr != "") {
    newStr = sizeStr.slice(-3) + "," + newStr;
    sizeStr = sizeStr.slice(0, -3);
  }

  return newStr.slice(0, -1) + " bytes";
}

export function fileNumberString(count) {
  if (count == 0) return "no files";
  if (count == 1) return "1 file";
  return count + " files";
}

export function Download(blob, filename) {
  const downloadUrl = URL.createObjectURL(blob, filename);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(downloadUrl);
}

export function extractFolder(fullFileName) {
  if (fullFileName.lastIndexOf("/") < 0) return "";
  return fullFileName.slice(0, fullFileName.lastIndexOf("/"))
}

export function extractFileName(fullFileName) {
  return fullFileName.slice(fullFileName.lastIndexOf("/") + 1);
}

export default isSymbolChar;