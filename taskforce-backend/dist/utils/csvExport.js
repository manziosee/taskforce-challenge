"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCSV = void 0;
const json2csv_1 = require("json2csv");
const generateCSV = (transactions) => {
    const fields = [
        { label: 'Date', value: 'date' },
        { label: 'Type', value: (row) => row.type.toUpperCase() },
        { label: 'Category', value: 'category' },
        { label: 'Subcategory', value: 'subcategory' },
        {
            label: 'Amount',
            value: (row) => row.type === 'income' ? row.amount : -row.amount
        },
        { label: 'Account', value: 'account' },
        { label: 'Description', value: 'description' }
    ];
    const opts = {
        fields,
        transforms: [
            (item) => (Object.assign(Object.assign({}, item), { date: new Date(item.date).toLocaleDateString() }))
        ]
    };
    try {
        const csv = (0, json2csv_1.parse)(transactions, opts);
        return csv;
    }
    catch (err) {
        console.error(err);
        throw new Error('Error generating CSV');
    }
};
exports.generateCSV = generateCSV;
