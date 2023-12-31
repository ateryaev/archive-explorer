import { XzReadableStream } from 'xzwasm';
import untar from "js-untar";
const JSZip = require("jszip");
const pako = require('pako');

export function FileInfo(name, bytes, date) {
    return {
        name,
        bytes,
        date,
        children: null
    }
}

async function unarchiveOne(file, onProgress) {
    const triers = [TryUngz, TryUnxz, TryUnzip, TryUntar];
    for (const trier of triers) {
        file.children = await trier(file, onProgress);
        if (file.children !== null) return;
    }
}

export async function unarchive(file, onProgress) {
    await unarchiveOne(file, onProgress);
    if (file.children === null) {
        //file.bytes = null; //clear memory in case of HUGE archive
        return;
    }
    for (let subfile of file.children) {
        await unarchive(subfile, onProgress);
    }
}

export function flatFiles(file) {
    if (file.children === null) return [file];
    let files = [];
    if (file.children.length === 1 && file.children[0].children !== null) {
        if (file.name.indexOf(file.children[0].name) > -1) {
            file.children[0].name = file.name;
            files.push(...flatFiles(file.children[0]));
            return files;
        }
    }
    for (let subfile of file.children) {
        if (subfile.name)
            if (file.name) subfile.name = file.name + '/' + subfile.name;
        subfile.name = subfile.name.replaceAll("/./", "/");
        files.push(...flatFiles(subfile));
    }
    return files;
}

function IsZip(bytes) {
    if (bytes.byteLength < 15) return false;
    return (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04);
}

async function TryUnzip(root, onProgress) {
    if (!IsZip(root.bytes)) return null;
    onProgress("unpacking zip " + root.name);
    let zip = null;
    let files = [];
    try {
        zip = await JSZip.loadAsync(root.bytes.buffer);
        let entries = [];
        zip.forEach(function (relativePath, zipEntry) {
            if (zipEntry.dir) return;
            entries.push(zipEntry);
        });
        for (const entry of entries) {
            const subBytes = await entry.async("uint8array");
            let fi = FileInfo(entry.name, subBytes, entry.date);
            if (!subBytes) {
                fi.bytes = new Uint8Array();
                fi.error = "unzip error";
            }
            files.push(fi);
        }
    } catch {
        return null;
    }
    return files;
}

function IsXz(bytes) {
    if (bytes.byteLength < 15) return false;
    return (bytes[0] === 0xFD && bytes[1] === 0x37 && bytes[2] === 0x7A && bytes[3] === 0x58);
}

async function TryUnxz(root, onProgress) {
    if (!IsXz(root.bytes)) return null;
    onProgress("unpacking xz " + root.name);
    let subfilename = root.name.slice(root.name.lastIndexOf("/") + 1);
    if (subfilename.slice(-3) === ".xz") {
        subfilename = subfilename.slice(0, -3);
    }
    const compressedStream = new ReadableStream({
        start(controller) {
            controller.enqueue(root.bytes);
            controller.close();
        },
    });
    try {
        const stream = new XzReadableStream(compressedStream);
        const decompressedResponse = new Response(stream);
        const buffer = await decompressedResponse.arrayBuffer();
        if (!buffer) {
            root.error = "unxz failure";
            return null;
        }
        return [FileInfo(subfilename, new Uint8Array(buffer), root.date)];
    } catch (e) {
        return null;
    }
}

function IsGzip(bytes) {
    if (bytes.byteLength < 15) return false;
    return (bytes[0] === 0x1F && bytes[1] === 0x8B && bytes[2] === 0x08 && bytes[3] === 0x00);
}

async function TryUngz(root, onProgress) {
    if (!IsGzip(root.bytes)) return null;
    onProgress("unpacking gzip " + root.name);
    let subfilename = root.name.slice(root.name.lastIndexOf("/") + 1);
    if (subfilename.slice(-3) === ".gz") {
        subfilename = subfilename.slice(0, -3);
    }
    try {
        const bytes = await pako.ungzip(root.bytes);
        if (!bytes) {
            root.error = "ungz failure";
            return null;
        }
        return [FileInfo(subfilename, bytes, root.date)];
    } catch (e) {
        return null;
    }
}

function IsChar(byte) {
    return (byte >= 32 && byte <= 126);
}

function IsTar(bytes) {
    if (bytes.byteLength < 500) return false;
    if (!IsChar(bytes[0])) return false;
    if (bytes[99] !== 0) return false;
    //ustar magic word
    if (!(bytes[257] === 117 && bytes[258] === 115 && bytes[259] === 116 &&
        bytes[260] === 97 && bytes[261] === 114)) return false;
    let isCharsOver = false;
    for (let i = 1; i < 99; i++) {
        if (bytes[i] === 0) isCharsOver = true;
        if (!isCharsOver && !IsChar(bytes[i])) return false;
        if (isCharsOver && bytes[i] !== 0) return false;
    }
    return true;
}

async function TryUntar(root, onProgress) {
    if (!IsTar(root.bytes)) return null;
    onProgress("unpacking tar " + root.name);
    try {
        const untarFiles = await untar(root.bytes.buffer);
        if (untarFiles.length < 1) return null;
        if (isNaN(untarFiles[0].checksum)) return null;
        if (isNaN(untarFiles[0].size)) return null;
        if (isNaN(untarFiles[0].gid)) return null;
        let files = [];
        for (const file of untarFiles) {
            if (file.type !== "0") continue;
            const date = new Date(file.mtime * 1000);
            files.push(FileInfo(file.name, new Uint8Array(file.buffer), date));
        }
        return files;
    } catch (e) {
        return null;
    }
}

export default unarchive;
