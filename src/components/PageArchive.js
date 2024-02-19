import FilterForm from './FilterForm'
import { useState, useRef, useMemo, useEffect } from 'react';
import * as helper from '../utils/helpers'
import FastPreview from './FastPreview';
import ListFooter from './ListFooter';
import * as Svg from './Svg';
import LongText from './LongText';
import FileTableRow from './FileTableRow';
import SortByMenu from './SortByMenu';

const defaultRenderSize = 500;

function sortFiles(filesToSort, field, order) {
    const compMult = order === "desc" ? -1 : 1;
    if (field === "size") {
        filesToSort.sort(function (a, b) { return compMult * (a.bytes.byteLength - b.bytes.byteLength); });
    } else if (field === "date") {
        filesToSort.sort(function (a, b) { return compMult * (a.date.valueOf() - b.date.valueOf()); });
    } else {
        filesToSort.sort(function (a, b) { return compMult * a.name.localeCompare(b.name); })
    }
}

const PageArchive = ({ name, files, onDownload, onFullscreen }) => {
    const [filter, setFilter] = useState("");
    const [renderSize, setRenderSize] = useState(defaultRenderSize);
    const [sortMenuActive, setSortMenuActive] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [sortField, setSortField] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    const fileListRef = useRef(null);

    const filesInPath = useMemo(
        () => {
            const filters = helper.filtersFromStr(filter);
            let filtered = files.filter((file) => {
                return helper.isTextMatchFilters(file.name, filters);
            });
            sortFiles(filtered, sortField, sortOrder);
            return filtered;
        },
        [files, filter, sortField, sortOrder]
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
        if (document.querySelector("input:focus") !== null) return;
        if (document.querySelector("button:active") !== null) return;
        if (document.querySelector("button:focus") !== null) return;

        if (filesInPath.length === 0) return;
        const maxIndex = Math.min(renderSize, filesInPath.length) - 1;
        let newSelectedIndex = selectedIndex;
        if (e.code === "ArrowUp") {
            newSelectedIndex = selectedIndex - 1;
        } else if (e.code === "ArrowDown") {
            newSelectedIndex = selectedIndex + 1;
        } else if (e.code === "Escape") {
            if (selectedIndex === -1) {
                fileListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
            setSelectedIndex(-1);
            return;
        } else if (e.code === "Enter" && selectedIndex > -1) {
            onFullscreen(filesInPath[selectedIndex]);
            return;
        } else if (e.code === "Space" || e.code === "PageDown") {
            newSelectedIndex = selectedIndex + 10;
            if (newSelectedIndex > maxIndex) newSelectedIndex = maxIndex;
        } else if (e.code === "End") {
            newSelectedIndex = maxIndex;
        } else if (e.code === "Home") {
            newSelectedIndex = 0;
        } else {
            return;
        }
        e.preventDefault();
        if (newSelectedIndex < 0) newSelectedIndex = maxIndex;
        if (newSelectedIndex > maxIndex) newSelectedIndex = Math.min(maxIndex, 0);
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

    function handleSortChange(f, o) {
        setSortField(f);
        setSortOrder(o);
        setSelectedIndex(-1);
        setSortMenuActive(false);
        fileListRef.current.focus();
        fileListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (<>
        <div className='page archive'>
            <div className='title2'>
                <div className='main'>
                    <LongText title={name} logo=<Svg.Zip /> onMouseDown={handleTitleClick} style={{ cursor: "pointer" }}>
                        {name}
                    </LongText>
                </div>
                <button onClick={() => { setSortMenuActive(!sortMenuActive); }} tabIndex={1} title={"current: " + sortField + " " + sortOrder}>
                    <Svg.Sort />
                </button>
                {sortMenuActive && (
                    <SortByMenu field={sortField} order={sortOrder} onChange={handleSortChange} />
                )}
            </div>

            <div className='filelist' ref={fileListRef} tabIndex={2}
                onFocus={() => setSortMenuActive(false)}
                onKeyDown={handleKeyDown}>
                <FilterForm onChange={handleFilterApply} filter={filter} name="pagearchive">
                    {filesInPath.length.toLocaleString()} files
                </FilterForm>
                {filesInPath.slice(0, renderSize).map((file, index) => (
                    <FileTableRow key={index} onMouseDown={() => handleShowPreview(index)} file={file} selected={selectedIndex === index} />
                ))}
                {Math.min(renderSize, filesInPath.length) === 0 && <div className="empty"><br />nothing was found<br /> change filter<br /><br /></div>}
                <div></div>
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
