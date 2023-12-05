import { useState, useEffect, useRef } from 'react';

const FilterForm = ({ filter, onChange, children }) => {
    const [preFilter, setPreFilter] = useState(filter);
    const filterInputRef = useRef(null);
    const helpStr = 'filter, use e.g. ORANGE !"GREEN APPLE" BANANA "2 RED CHERRIES"'

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
        filterInputRef.current.focus();
        if (preFilter === filter) return;
        onChange(preFilter);
    }

    function handleClear() {
        setPreFilter("");
        onChange("");
        filterInputRef.current.focus();
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
                    placeholder={helpStr}
                    onInput={handleInput}
                    type='text'
                    onKeyDown={handleKeyDown}
                    autoCorrect="off" autoCapitalize="none" spellCheck="false" autoComplete="off"
                />
                {(filter === preFilter && filter !== "") && (
                    <button tabIndex={-1} onClick={handleClear} className='clear'>reset</button>
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
