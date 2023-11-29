
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function log(msg) {
  const now = new Date();
  const time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds();
  console.log(time, msg);
}

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

// export function fileNumberString(count) {
//   if (count == 0) return "no files";
//   if (count == 1) return "1 file";
//   return count + " files";
// }

export function Download(bytes, filename) {
  const fullName = filename;
  const downloadName = fullName.slice(fullName.lastIndexOf("/") + 1);
  const dataView = new DataView(bytes.buffer);
  const blob = new Blob([dataView]);
  const downloadUrl = URL.createObjectURL(blob, downloadName);
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

export function testIfText(bytes) {
  let numOfBins = 0;
  const checkSize = Math.min(100, bytes.byteLength);
  for (let i = 0; i < checkSize; i++) {
    if (!isTextChar(bytes[i])) numOfBins++;
  }
  const binRatio = (numOfBins + 1) / (checkSize + 1);
  return binRatio < 0.05;
}
export function toTxtPreview(bytes, size) {
  const enc = new TextDecoder("utf-8");
  const arr = bytes.slice(0, size);
  return enc.decode(arr);
}
export function toHexPreview(bytes, size) {
    let str = "";
    let txt = "";
    const len = Math.min(size, 16 * Math.ceil(bytes.byteLength / 16));
    for (let i = 0; i < len; i++) {
      const outOfBound = i >= bytes.byteLength;
      const byte = outOfBound ? 0 : bytes[i];
      if (i % 16 == 0) {
        str += ("00000000" + i.toString(16)).slice(-8) + " | ";
      }
      if (i % 16 == 8) str += " ";
      if (!outOfBound) {
        str += ("00" + byte.toString(16)).slice(-2) + " ";
        txt += isSymbolChar(byte) ? String.fromCharCode(byte) : ".";
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
}
export default isSymbolChar;