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
        //setPreFilter(filter);
        onChange(preFilter);
        filterInputRef.current.focus();
    }

    return (
        <div className='filter'>
            <div>Filter</div>
            <input
                value={preFilter}
                ref={filterInputRef}
                placeholder='no filter, try e.g. "apple banana !orange"'
                onInput={handleInput}
                type='text'
                onKeyDown={handleKeyDown}
            />
            {(filter !== preFilter) && (<button onClick={handleApply}>apply</button>)}
            {(filter === preFilter) && (<div>{children}</div>)}
        </div>
    );
};

export default FilterForm;
