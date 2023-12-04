import { useState, useEffect, useRef } from 'react';

const FilterForm = ({ filter, onChange, children }) => {
    //const [filter, setFilter] = useState(value);
    const [preFilter, setPreFilter] = useState(filter);
    const filterInputRef = useRef(null);

    useEffect(() => {
        setPreFilter(filter);
    }, [filter]);
    function handleInput(e) {
        setPreFilter(e.target.value);
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") handleApply();
    }

    function handleApply() {
        if (preFilter === filter) return;
        onChange(preFilter);
    }

    function handleClear() {
        setPreFilter("");
        onChange("");
    }

    return (
        <div className='infopanel filter2'>
            <div><span>Filter</span></div>
            <div className='inputButton'>
                <input
                    className='main'
                    tabIndex={1}
                    value={preFilter}
                    ref={filterInputRef}
                    placeholder='no filter, try e.g. "apple banana !orange"'
                    onInput={handleInput}
                    type='text'
                    onKeyDown={handleKeyDown}
                    autoCorrect="off" autoCapitalize="none" spellCheck="false" autoComplete="off"
                />
                {(filter === preFilter && filter !== "") && (
                    <button tabIndex={1} onClick={handleClear} className='clear'>reset</button>
                )}
                {(filter !== preFilter) && (
                    <button tabIndex={1} onClick={handleApply}>apply</button>
                )}
            </div>
            <div>
                <span>{children}</span>
            </div>
        </div>
    );
};

export default FilterForm;
