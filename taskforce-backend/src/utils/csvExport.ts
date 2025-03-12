import { parse } from 'json2csv';

export const generateCSV = (transactions: any[]) => {
  const fields = [
    { label: 'Date', value: 'date' },
    { label: 'Type', value: 'type' },
    { label: 'Category', value: 'category' },
    { label: 'Amount', value: 'amount' }
  ];

  const opts = { fields };
  try {
    const csv = parse(transactions, opts);
    return csv;
  } catch (err) {
    console.error(err);
    throw new Error('Error generating CSV');
  }
};