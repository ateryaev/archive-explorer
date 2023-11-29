import ArchiveTitle from './ArchiveTitle'
import FilterForm from './FilterForm'
import PagePreview from './PagePreview';
import { useState, useRef, useMemo } from 'react';
import * as helper from '../utils/helpers'
import FastPreview from './FastPreview';
import ListFooter from './ListFooter';

const PageArchive = ({ name, files, onDownload, onFullscreen }) => {
    const [filter, setFilter] = useState("");
    const defaultRenderSize = 500;
    const [renderSize, setRenderSize] = useState(defaultRenderSize);
    const fileListRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    function handleShowMore(e) {
        e.preventDefault();
        setRenderSize(renderSize + defaultRenderSize);
    }

    function handleShowPreview(index, e) {
        setTimeout(() => {
            e.target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
        }, 0);
        if (index == selectedIndex) {
            setSelectedIndex(-1);
        } else {
            setSelectedIndex(index);
        }
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

    function handleKeyDown(e) {
        if (filesInPath.length == 0) return;
        let newSelectedIndex = selectedIndex;
        if (e.code === "ArrowUp") {
            newSelectedIndex = selectedIndex - 1;
        } else if (e.code === "ArrowDown") {
            newSelectedIndex = selectedIndex + 1;
        } else {
            return;
        }
        e.preventDefault();
        if (newSelectedIndex < 0) newSelectedIndex = filesInPath.length - 1;
        if (newSelectedIndex > filesInPath.length - 1) newSelectedIndex = 0;
        setSelectedIndex(newSelectedIndex);
        setTimeout(async () => {
            const selectedDiv = document.querySelector("div.selected");
            if (!selectedDiv) return;
            helper.log("ARCHIVE SCROLL", selectedDiv)
            selectedDiv.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
        }, 0);
    }

    function handleFilterApply(filter) {
        setFilter(filter);
        setSelectedIndex(-1);
        setRenderSize(defaultRenderSize);
        fileListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (<>
        <div className='page'>
            
            <div className='title infopanel'>
                <div><span>{name}</span></div>
            </div>
            <div className='filelist' ref={fileListRef} tabIndex={2}
                onKeyDown={(e) => handleKeyDown(e)}>
                <FilterForm onChange={handleFilterApply} filter={filter}>
                    {filesInPath.length.toLocaleString()} files
                </FilterForm>

                {filesInPath.slice(0, renderSize).map((file, index) => (
                    <div key={index} className={selectedIndex == index ? 'fileRow selected' : 'fileRow'}
                        onClick={(e) => handleShowPreview(index, e)}>
                        <div>
                            {file.name}
                        </div>
                        <div>{helper.sizeToString(file.bytes.byteLength)}</div>
                    </div>
                ))}
                <ListFooter 
                    current={Math.min(renderSize, filesInPath.length)} 
                    total={filesInPath.length} unit={"file"}
                    onMore={handleShowMore}/>
                    
                {/* {(renderSize < filesInPath.length) && (
                    <div className='filter info'>
                        <div>showing only first {renderSize} of {helper.fileNumberString(filesInPath.length)}, use filter</div>
                        <button onClick={(e) => handleShowMore(e)}>show more</button>
                    </div>
                )}
                {(renderSize >= filesInPath.length && filesInPath.length > 1) && (
                    <div className='filter info'>
                        <div>all {helper.fileNumberString(filesInPath.length)} shown</div>
                    </div>
                )}
                {(renderSize >= filesInPath.length && filesInPath.length == 1) && (
                    <div className='filter info'>
                        <div>only one file was found</div>
                    </div>
                )}
                {(filter !== "" && filesInPath.length == 0) && (
                    <div className='filter info'>
                        <div>nothing was found</div>
                    </div>
                )}
                {(filter === "" && filesInPath.length == 0) && (
                    <div className='filter info'>
                        <div>not an archive file, of format not supported</div>
                    </div>
                )} */}
            </div>
        </div>
        {(selectedIndex >= 0) && (
            <FastPreview 
                onDownload={()=>onDownload(filesInPath[selectedIndex])} 
                onFullscreen={()=>onFullscreen(filesInPath[selectedIndex])} 
                file={filesInPath[selectedIndex]} />
        )}
    </>
    );
};

export default PageArchive;
