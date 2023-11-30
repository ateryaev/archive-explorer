const ListFooter = ({ current, total, unit, onMore }) => {
  let status = "";
  if (current < total) {
    status = "showing first " + current.toLocaleString() + " of " + total.toLocaleString() + " " + unit + "s";
  } else if (current > 1) {
    status = "showing all " + current.toLocaleString() + " " + unit + "s";
  } else if (current == 1) {
    status = "only 1 " + unit + " found";
  } else {
    status = "nothing found";
  }
  return (
    <div className='infopanel'>
      <div className='main'>
        <span className='main'>{status}&nbsp;</span>
        {current != total && <button tabIndex="-1" onClick={onMore}>show more</button>}
      </div>
    </div>
  );
};

export default ListFooter;
