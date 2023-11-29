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
        //filterInputRef.current.focus();
    }

    return (
        <div className='infopanel filter2'>
            <div><span>Filter</span></div>
            <input
            className='main'
                tabIndex={1}
                value={preFilter}
                ref={filterInputRef}
                placeholder='no filter, try e.g. "apple banana !orange"'
                onInput={handleInput}
                type='text'
                onKeyDown={handleKeyDown}
            />
            <div>
            {(filter !== preFilter) && (<button onClick={handleApply}>apply</button>)}
            {(filter === preFilter) && (<span>{children}</span>)}
            </div>
        </div>
    );
};

export default FilterForm;
