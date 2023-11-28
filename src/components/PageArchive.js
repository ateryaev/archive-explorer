import ArchiveTitle from './ArchiveTitle'
import FilterForm from './FilterForm'
import PagePreview from './PagePreview';
import { useState, useRef, useMemo } from 'react';
import * as helper from '../utils/helpers'

const PageArchive = ({ name, files }) => {
    const [filter, setFilter] = useState("");
    const defaultRenderSize = 500;
    const [renderSize, setRenderSize] = useState(defaultRenderSize);
    const fileListRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isBigPreview, setBigPreview] = useState(false);

    function handleShowMore(e) {
        e.preventDefault();
        setRenderSize(renderSize + defaultRenderSize);
    }

    function handleShowPreview(index, e) {
        //console.log(e.target.scrollIntoView);
        setTimeout(() => {
            e.target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
        }, 0);
        //scrollTo({ top: 0, behavior: 'smooth' });
        setSelectedIndex(index);
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
        setSelectedIndex(-1);
        setRenderSize(defaultRenderSize);
        fileListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (<>
        <div className={(selectedIndex == -1 || !isBigPreview) ? 'page archive' : 'page archive hidden'}>
            <div className='title'>
                <div>{name}</div>
                <div></div>
            </div>
            <div className='filelist' ref={fileListRef} >
                <FilterForm onChange={handleFilterApply} filter={filter}>
                    {helper.fileNumberString(filesInPath.length)}
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
                {(renderSize < filesInPath.length) && (
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
                )}
            </div>
        </div>

        {(selectedIndex >= 0) && (<PagePreview file={filesInPath[selectedIndex]}
            onCloseClick={() => { setSelectedIndex(-1) }}
            onExpandClick={() => { setBigPreview(!isBigPreview) }}
            fullScreen={isBigPreview}></PagePreview>)}
    </>
    );
};

export default PageArchive;
