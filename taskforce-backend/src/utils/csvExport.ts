import { parse } from 'json2csv';

export const generateCSV = (transactions: any[]) => {
  const fields = [
    { label: 'Date', value: 'date' },
    { label: 'Type', value: (row: any) => row.type.toUpperCase() },
    { label: 'Category', value: 'category' },
    { label: 'Subcategory', value: 'subcategory' },
    { 
      label: 'Amount', 
      value: (row: any) => row.type === 'income' ? row.amount : -row.amount 
    },
    { label: 'Account', value: 'account' },
    { label: 'Description', value: 'description' }
  ];

  const opts = { 
    fields,
    transforms: [
      (item: any) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString()
      })
    ]
  };

  try {
    const csv = parse(transactions, opts);
    return csv;
  } catch (err) {
    console.error(err);
    throw new Error('Error generating CSV');
  }
};