const ArchiveTitle = ({ name, count }) => {
  return (
    <div className='title'>
      <div>
        {name}
      </div>
      <div>
        {count == 0 ? "no" : count}
        {count == 1 ? " file" : " files"}
      </div>
    </div>
  );
};

export default ArchiveTitle;
