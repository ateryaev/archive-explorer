import FilterForm from './FilterForm'
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
            e.target.scrollIntoView({ behavior: "instant", block: "nearest", inline: "nearest" })
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
                return helper.isTextMatchFilters(file.name, filters);
            });
        },
        [files, filter]
    );

    function handleKeyDown(e) {
        if (filesInPath.length == 0) return;
        //console.log(e.code)
        let newSelectedIndex = selectedIndex;
        if (e.code === "ArrowUp") {
            newSelectedIndex = selectedIndex - 1;
            if (newSelectedIndex < 0) {
                fileListRef.current.scrollTop = 0;
                newSelectedIndex = 0;
            }
        } else if (e.code === "ArrowDown") {
            newSelectedIndex = selectedIndex + 1;
            if (newSelectedIndex > filesInPath.length - 1) {
                fileListRef.current.scrollTop = fileListRef.current.scrollHeight;
                newSelectedIndex = filesInPath.length - 1;
            }
        } else if (e.code === "Escape") {
            setSelectedIndex(-1);
            e.preventDefault();
            return;
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
            selectedDiv.scrollIntoView({ behavior: "instant", block: "nearest", inline: "nearest" })
        }, 0);
    }

    function handleFilterApply(filter) {
        setFilter(filter);
        setSelectedIndex(-1);
        setRenderSize(defaultRenderSize);
        fileListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleTitleClick(e) {
        e.preventDefault();
        fileListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (<>
        <div className='page archive'>

            <div className='title infopanel'>
                <div onMouseDown={handleTitleClick} style={{ cursor: "pointer" }}><span>{name}</span></div>
            </div>
            <div className='filelist' ref={fileListRef} tabIndex={2}
                onKeyDown={handleKeyDown}>
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
                    onMore={handleShowMore} />
            </div>
        </div>
        {(selectedIndex >= 0) && (
            <FastPreview
                onDownload={() => onDownload(filesInPath[selectedIndex])}
                onFullscreen={() => onFullscreen(filesInPath[selectedIndex])}
                file={filesInPath[selectedIndex]} />
        )}
    </>
    );
};

export default PageArchive;
