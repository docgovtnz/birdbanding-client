import { formatISO } from 'date-fns';

/**
 * takes a list of objects, a header object, and the prefix to the file name to download,
 * the keys of the header object must be in each of the data objects, the values of the header object
 * will be the column headers
 * @param headers keys are what are used to build the csv, keys must be a subset of keys of data object, values are column headers
 * @param filePrefix prefix of the produced file
 * @param dataList each object will be a row in the exported csv
 */

export const csvGenerator = (headers: object, filePrefix: string, dataList: any[]) => {
  // write the header line, the header is the value for each key
  const csvHeader = writeLine(headers, headers);
  const csvBody = dataList.map(d => writeLine(d, headers)).join('');
  const csvText = csvHeader + csvBody;
  const blob = new Blob([csvText], { type: 'text/csv;' });
  const url = URL.createObjectURL(blob);
  const fileName = `${filePrefix}_${formatISO(new Date())}.csv`;
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, fileName);
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
};

const writeLine = (itemToWrite: object, headers: object): string => {
  const values = Object.keys(headers).map(key => {
    return itemToWrite[key];
  });
  return '"' + values.join('","') + '"\n';
};
