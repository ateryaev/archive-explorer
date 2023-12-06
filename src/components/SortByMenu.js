import { SortAsc } from './Svg'

const SortByMenu = ({ field, order, onChange, ...props }) => {
  //const sorts = ["name \u25BE", "size", "date"];
  const fields = ["name", "size", "date"];
  function handleClick(f) {
    let o = "asc"
    if (f === field) {
      o = order === "asc" ? "desc" : "asc"
    }
    onChange(f, o);
  }

  return (
    <div className='submenu' {...props}>
      {fields.map((f, index) => (
        <button
          tabIndex="1"
          key={index}
          onClick={() => handleClick(f)}
          className={order + (field === f ? " selected" : "")}
        >
          {f} {field === f && <SortAsc />}
        </button>
      ))}
    </div>
  );
};

export default SortByMenu;
