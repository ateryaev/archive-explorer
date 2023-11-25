import ArchiveTitle from './ArchiveTitle'
import FilterForm from './FilterForm'
import { useState, useRef, useMemo } from 'react';

const PageArchive = ({ name, files }) => {
    const [filter, setFilter] = useState("");
    const defaultRenderSize = 500;
    const [renderSize, setRenderSize] = useState(defaultRenderSize);
    const fileListRef = useRef(null);

    function Download(blob, filename) {
        const downloadUrl = URL.createObjectURL(blob, filename);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(downloadUrl);
    }
    function sizeToString(filesize) {
        const unitNames = [' bytes', ' KB', ' MB', ' GB', ' TB'];
        let unitCount = filesize;
        let unitIndex = 0;
    
        while(unitCount > 1024) {
            unitCount /= 1024;
            unitIndex ++;
        }
        let decimals = 1;
    
        if (unitCount.toFixed(1).slice(-2) == ".0") decimals = 0;
        
        return unitCount.toFixed(decimals) + unitNames[unitIndex];
    }
    
    function extractFolder(fullFileName) {
        return fullFileName.slice(0, fullFileName.lastIndexOf("/"))
    }

    function extractFileName(fullFileName) {
        return fullFileName.slice(fullFileName.lastIndexOf("/") + 1);
    }

    function handleDownload(index, e) {
        e.preventDefault();
        const fullName = filesInPath[index].name;
        const downloadName = fullName.slice(fullName.lastIndexOf("/") + 1);
        const dataView = new DataView(filesInPath[index].bytes.buffer);
        const blob = new Blob([dataView]);
        Download(blob, downloadName);
        return false;
    }

    function handleShowMore(e) {
        e.preventDefault();
        setRenderSize(renderSize + defaultRenderSize);
    }

    const filesInPath = useMemo(
        () => {
            const filters = filter.toUpperCase().split(" ");
            return files.filter((file) => {
                for (const f of filters) {
                    if (file.name.toUpperCase().indexOf(f) == -1) return false;
                }
                return true
            });
        },
        [files, filter]
    );

    function handleFilterApply(filter) {
        setFilter(filter);
        fileListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <div className='page archive'>
            <ArchiveTitle name={name} count={files.length} />
            <FilterForm onChange={handleFilterApply} />
            <div className='filelist' ref={fileListRef} >
                {(filter && filter > "") && (
                    <div className='fileRow info'>
                        <div>Filter: {filter}</div>
                        <div>{filesInPath.length == 0 ? "no" : filesInPath.length}
                            {filesInPath.length == 1 ? " file" : " files"}</div>

                    </div>
                )}
                {filesInPath.slice(0, renderSize).map((file, index) => (
                    <div key={index} className='fileRow'>
                        <div>
                            {extractFolder(file.name)}/
                            <a title='download' onClick={(e) => handleDownload(index, e)}>{extractFileName(file.name)}</a>
                        </div>
                        <div>{sizeToString(file.bytes.byteLength)}</div>
                    </div>
                ))}
                {(renderSize < filesInPath.length) && (
                    <div className='fileRow info'>
                        <div>showing only first {renderSize} of {filesInPath.length} files, use filter</div>
                        <div><a href="#" onClick={(e) => handleShowMore(e)}>show more</a></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageArchive;
