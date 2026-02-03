const XLSX = require('xlsx');
const generateStockLogExcel = (data) => {
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = currentDate.getFullYear();
  const filename = `Stock_log_entry-${day}-${month}-${year}.xls`;

  // Format data for Excel
  const excelData = data.map((entry, index) => ({
    'S.No': index + 1,
    'Material Number': entry.materialCode || '',
    'Material Name': entry.materialName || '',
    'Quantity': entry.quantity || 0,
    'Unit': entry.unit || '',
    'Entry Type': entry.entryType || '',
    'User': entry.userFirstName || entry.createdBy || 'Unknown',
    'Updated Time': entry.createdAt ? formatDateTime(entry.createdAt) : ''
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // S.No
    { wch: 18 }, // Material Number
    { wch: 35 }, // Material Name
    { wch: 12 }, // Quantity
    { wch: 10 }, // Unit
    { wch: 12 }, // Entry Type
    { wch: 20 }, // User
    { wch: 22 }  // Updated Time
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Log Entries');

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xls' });

  return { buffer, filename };
};

const generateCurrentStockExcel = (data) => {
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = currentDate.getFullYear();
  const filename = `Current_stock_data-${day}-${month}-${year}.xls`;

  // Format data for Excel
  const excelData = data.map((item, index) => ({
    'S.No': index + 1,
    'Material Number': item.materialCode || '',
    'Material Name': item.materialName || '',
    'Current Item': `${item.currentQuantity || 0} ${item.unit || ''}`
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // S.No
    { wch: 18 }, // Material Number
    { wch: 35 }, // Material Name
    { wch: 20 }  // Current Item
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Current Stock Data');

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xls' });

  return { buffer, filename };
};
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);
  
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  
  return `${day} ${month} ${year} - ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

module.exports = {
  generateStockLogExcel,
  generateCurrentStockExcel
};
