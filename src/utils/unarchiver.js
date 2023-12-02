import { XzReadableStream } from 'xzwasm';
import untar from "js-untar";
const JSZip = require("jszip");
const pako = require('pako');

export function FileInfo(name, bytes) {
    return {
        name,
        bytes,
        children: null
    }
}

async function unarchiveOne(file, onProgress) {
    const triers = [TryUngz, TryUnxz, TryUnzip, TryUntar];
    for (const trier of triers) {
        file.children = await trier(file.bytes, file.name, onProgress);
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

async function TryUnzip(bytes, filename, onProgress) {
    if (!IsZip(bytes)) return null;
    onProgress("unpacking zip " + filename + "...");
    let zip = null;
    let files = [];
    try {
        zip = await JSZip.loadAsync(bytes.buffer);
        let entries = [];
        zip.forEach(function (relativePath, zipEntry) {
            if (zipEntry.dir) return;
            entries.push(zipEntry);
        });
        for (const entry of entries) {
            const subBytes = await entry.async("uint8array");
            files.push(FileInfo(entry.name, subBytes));
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

async function TryUnxz(bytes, filename, onProgress) {
    if (!IsXz(bytes)) return null;
    onProgress("unpacking xz " + filename + "...");
    let subfilename = filename.slice(filename.lastIndexOf("/") + 1);
    if (subfilename.slice(-3) === ".xz") {
        subfilename = subfilename.slice(0, -3);
    }
    const compressedStream = new ReadableStream({
        start(controller) {
            controller.enqueue(bytes);
            controller.close();
        },
    });
    try {
        const stream = new XzReadableStream(compressedStream);
        const decompressedResponse = new Response(stream);
        const buffer = await decompressedResponse.arrayBuffer();
        return [FileInfo(subfilename, new Uint8Array(buffer))];
    } catch (e) {
        return null;
    }
}

function IsGzip(bytes) {
    if (bytes.byteLength < 15) return false;
    return (bytes[0] === 0x1F && bytes[1] === 0x8B && bytes[2] === 0x08 && bytes[3] === 0x00);
}

async function TryUngz(bytes, filename, onProgress) {
    if (!IsGzip(bytes)) return null;
    onProgress("unpacking gzip " + filename + "...");
    let subfilename = filename.slice(filename.lastIndexOf("/") + 1);
    if (subfilename.slice(-3) === ".gz") {
        subfilename = subfilename.slice(0, -3);
    }
    try {
        return [FileInfo(subfilename, await pako.ungzip(bytes))];
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

async function TryUntar(uint8Array, filename, onProgress) {
    if (!IsTar(uint8Array)) return null;
    onProgress("unpacking tar " + filename + "...");
    try {
        const untarFiles = await untar(uint8Array.buffer);
        if (untarFiles.length < 1) return null;
        if (isNaN(untarFiles[0].checksum)) return null;
        if (isNaN(untarFiles[0].size)) return null;
        if (isNaN(untarFiles[0].gid)) return null;
        let files = [];
        for (const file of untarFiles) {
            if (file.type !== "0") continue;
            files.push(FileInfo(file.name, new Uint8Array(file.buffer)));
        }
        return files;
    } catch (e) {
        return null;
    }
}

export default unarchive;
