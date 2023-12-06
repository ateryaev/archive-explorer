import { useEffect, useMemo } from 'react';
import * as helper from '../utils/helpers'

const FileTableRow = ({ file, selected, ...props }) => {

  // useEffect(() => {
  //   console.log("ROW", file.name);
  // }, []);

  const size = useMemo(
    () => {
      const varStr = helper.sizeToString(file.bytes.byteLength);
      const fixedStr = ("      " + varStr).slice(-10);
      return fixedStr.replaceAll(' ', '\u00A0')
    },
    [file]
  );
  const date = useMemo(
    () => {
      const D = file.date.getDate().toLocaleString(undefined, { minimumIntegerDigits: 2 });
      const M = (file.date.getMonth() + 1).toLocaleString(undefined, { minimumIntegerDigits: 2 });
      const Y = file.date.getFullYear();
      const h = file.date.getHours().toLocaleString(undefined, { minimumIntegerDigits: 2 });
      const m = file.date.getMinutes().toLocaleString(undefined, { minimumIntegerDigits: 2 });
      const s = file.date.getSeconds().toLocaleString(undefined, { minimumIntegerDigits: 2 });
      return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    },
    [file]
  );
  const cls = useMemo(
    () => {
      return selected ? 'fileRow selected' : 'fileRow';
    },
    [selected]
  );

  return (
    <div className={cls} {...props}>
      <div className='name'>{file.name}</div>
      <div className='date'>{date}</div>
      <div className='size'>{size}</div>
    </div>
  );
};

export default FileTableRow;
