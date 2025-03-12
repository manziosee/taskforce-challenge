"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCSV = void 0;
const json2csv_1 = require("json2csv");
const generateCSV = (transactions) => {
    const fields = [
        { label: 'Date', value: 'date' },
        { label: 'Type', value: 'type' },
        { label: 'Category', value: 'category' },
        { label: 'Amount', value: 'amount' }
    ];
    const opts = { fields };
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
