import { useState, useEffect, useRef } from 'react';

const FilterForm = ({ onChange }) => {
    const [filter, setFilter] = useState("");
    const [preFilter, setPreFilter] = useState("");
    const filterInputRef = useRef(null);

    function handleFilter(e) {
        setFilter(e.target.value);
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") handleApply();
    }

    function handleApply() {
        if (preFilter === filter) return;
        setPreFilter(filter);
        onChange(filter);
        filterInputRef.current.focus();
    }

    return (
        <div className='filter'>
            <input
                value={filter}
                ref={filterInputRef}
                type='text'
                placeholder='filter keywords, e.g. "jpeg public"'
                onInput={handleFilter}
                onKeyDown={handleKeyDown}
            />
            {(filter !== preFilter) && (<button onClick={handleApply}>apply</button>)}
        </div>
    );
};

export default FilterForm;
