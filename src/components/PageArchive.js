import FilterForm from './FilterForm'
import { useState, useRef, useMemo, useEffect, Fragment } from 'react';
import * as helper from '../utils/helpers'
import FastPreview from './FastPreview';
import ListFooter from './ListFooter';
import * as Svg from './Svg';
import LongText from './LongText';

const sorts = ["name asc", "name desc", "size asc", "size desc"];
const defaultRenderSize = 500;

function sortFiles(filesToSort, sortByIndex) {
    const compMult = sorts[sortByIndex].indexOf("desc") > 0 ? -1 : 1;
    if (sorts[sortByIndex].slice(0, 4) === "size") {
        filesToSort.sort(function (a, b) { return compMult * (a.bytes.byteLength - b.bytes.byteLength); });
    } else {
        filesToSort.sort(function (a, b) { return compMult * a.name.localeCompare(b.name); })
    }
}

const PageArchive = ({ name, files, onDownload, onFullscreen }) => {
    const [filter, setFilter] = useState("");
    const [renderSize, setRenderSize] = useState(defaultRenderSize);
    const [sortMenuActive, setSortMenuActive] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [sortBy, setSortBy] = useState(0);

    const sortMenuRef = useRef(null);
    const fileListRef = useRef(null);

    const filesInPath = useMemo(
        () => {
            const filters = filter.toUpperCase().split(" ");
            let filtered = files.filter((file) => {
                return helper.isTextMatchFilters(file.name, filters);
            });
            sortFiles(filtered, sortBy);
            return filtered;
        },
        [files, filter, sortBy]
    );

    useEffect(() => {
        const selectedDiv = document.querySelector("div.selected");
        if (!selectedDiv) return;
        const maxIndex = Math.min(renderSize, filesInPath.length) - 1;
        if (selectedIndex === 0) {
            fileListRef.current.scrollTop = 0;
        } else if (selectedIndex === maxIndex) {
            fileListRef.current.scrollTop = fileListRef.current.scrollHeight;
        } else {
            selectedDiv.scrollIntoView({ behavior: "instant", block: "nearest", inline: "nearest" });
        }
    }, [selectedIndex, filesInPath, renderSize])

    function handlePreviewClick() {
        const selectedDiv = document.querySelector("div.selected");
        if (!selectedDiv) return;
        const maxIndex = Math.min(renderSize, filesInPath.length) - 1;
        if (selectedIndex === 0) {
            fileListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (selectedIndex === maxIndex) {
            fileListRef.current.scrollTo({ top: fileListRef.current.scrollHeight, behavior: 'smooth' });
        } else {
            selectedDiv.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        }
    }
    function handleShowMore(e) {
        e.preventDefault();
        setRenderSize(renderSize + defaultRenderSize);
    }

    function handleShowPreview(index) {
        if (index === selectedIndex) {
            setSelectedIndex(-1);
        } else {
            setSelectedIndex(index);
        }
    }



    function handleKeyDown(e) {
        if (filesInPath.length === 0) return;
        const maxIndex = Math.min(renderSize, filesInPath.length) - 1;
        let newSelectedIndex = selectedIndex;
        if (e.code === "ArrowUp") {
            newSelectedIndex = selectedIndex - 1;
        } else if (e.code === "ArrowDown") {
            newSelectedIndex = selectedIndex + 1;
        } else if (e.code === "Escape") {
            setSelectedIndex(-1);
            return;
            // } else if (e.code === "Enter" && selectedIndex > -1) {
            //     onFullscreen(filesInPath[selectedIndex]);
            //     return;
        } else {
            return;
        }
        e.preventDefault();
        if (newSelectedIndex < 0) newSelectedIndex = maxIndex;
        if (newSelectedIndex > maxIndex) newSelectedIndex = 0;
        setSelectedIndex(newSelectedIndex);
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

    function handleSortClick() {
        setSortMenuActive(!sortMenuActive);
    }

    function handleSort(index) {
        setSortBy(index);
        setSelectedIndex(-1);
        setSortMenuActive(false);
        fileListRef.current.focus();
        fileListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const logo = <Svg.Zip />;

    return (<>
        <div className='page archive'>
            <div className='title2'>
                <div className='main'>
                    <LongText title={name} logo=<Svg.Zip /> onMouseDown={handleTitleClick} style={{ cursor: "pointer" }}>
                        {name}
                    </LongText>
                </div>
                <button onClick={handleSortClick} tabIndex={1} title={"current: " + sorts[sortBy]}>
                    <Svg.Sort />
                </button>
                {sortMenuActive && (
                    <div ref={sortMenuRef} className='submenu'>
                        {sorts.map((sort, index) => (
                            <button tabIndex="1" key={index} onClick={() => handleSort(index)} className={sortBy === index ? "selected" : ""}>{sort}</button>
                        ))}
                    </div>
                )}
            </div>

            <div className='filelist' ref={fileListRef} tabIndex={1}
                onFocus={() => setSortMenuActive(false)}
                onKeyDown={handleKeyDown}>
                <FilterForm onChange={handleFilterApply} filter={filter}>
                    {filesInPath.length.toLocaleString()} files
                </FilterForm>

                {filesInPath.slice(0, renderSize).map((file, index) => (
                    <div key={index} className={selectedIndex === index ? 'fileRow selected' : 'fileRow'}
                        onClick={(e) => handleShowPreview(index, e)}>
                        <div>
                            {file.name}
                        </div>

                        <div>{helper.sizeToString(file.bytes.byteLength)}</div>

                    </div>
                ))}
                {Math.min(renderSize, filesInPath.length) === 0 && <div className="empty"><br />nothing was found<br /> change filter<br /><br /></div>}
                <ListFooter
                    current={Math.min(renderSize, filesInPath.length)}
                    total={filesInPath.length} unit={"file"}
                    onMore={handleShowMore} />
            </div>
        </div>
        {(selectedIndex >= 0) && (
            <FastPreview onFocus={() => setSortMenuActive(false)}
                onTitleClick={handlePreviewClick}
                onDownload={() => onDownload(filesInPath[selectedIndex])}
                onFullscreen={() => onFullscreen(filesInPath[selectedIndex])}
                file={filesInPath[selectedIndex]} />
        )}
    </>
    );
};

export default PageArchive;
