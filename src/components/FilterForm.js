import { useState, useEffect, useRef } from 'react';

function HistoryList(id) {
    const key = "HistoryList_" + id;
    let storedHistory = JSON.parse(localStorage.getItem(key));
    if (!storedHistory) storedHistory = [];

    this.push = (historyItem) => {
        if (historyItem === "") return;
        storedHistory = storedHistory.filter((word) => word !== historyItem);
        storedHistory.push(historyItem);
        storedHistory = storedHistory.slice(-100);
        localStorage.setItem(key, JSON.stringify(storedHistory));
    }
    this.all = () => { return storedHistory.slice(); }
    this.size = () => { return storedHistory.length; }
}

const FilterForm = ({ filter, onChange, children, name }) => {
    const [preFilter, setPreFilter] = useState(filter);
    const [history, setHistory] = useState(["history1", filter]);
    const [historyIdx, setHistoryIdx] = useState(1);

    const filterInputRef = useRef(null);
    const helpStr = 'filter, use e.g. ORANGE !"GREEN APPLE" BANANA "2 RED CHERRIES"'
    const historyList = new HistoryList(name);

    useEffect(() => {
        historyList.push(filter);
        let storedHistory = historyList.all();
        storedHistory.push("");
        const isEmptyFilter = (filter === "");
        setHistoryIdx(storedHistory.length - (isEmptyFilter ? 1 : 2));
        setHistory(storedHistory);
        setPreFilter(filter);
        console.log("LOAD FILTER HISTORY", storedHistory)
    }, [filter]);

    function handleInput(e) {
        setPreFilter(e.target.value);

        if (history[historyIdx] !== e.target.value) {
            history[history.length - 1] = e.target.value;
            setHistory(history.slice());
            setHistoryIdx(history.length - 1);
        }
        console.log(history);
    }

    function handleKeyDown(e) {
        //console.log("keydown", e.key)
        if (e.key === "Enter") handleApply();
        if (e.key === "ArrowUp" && historyIdx > 0) {
            setHistoryIdx(historyIdx - 1);
            setPreFilter(history[historyIdx - 1]);
        }
        if (e.key === "ArrowDown" && historyIdx < history.length - 1) {
            setHistoryIdx(historyIdx + 1);
            setPreFilter(history[historyIdx + 1]);
        }
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
