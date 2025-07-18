const wkhtmltopdf = require('wkhtmltopdf');
const fs = require('fs');
const path = require('path');

// Test HTML content
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test PDF</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      padding: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #000;
      padding: 8px;
      text-align: center;
    }
    th {
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>
  <h1>Test PDF Generation</h1>
  <table>
    <thead>
      <tr>
        <th>No</th>
        <th>Nama</th>
        <th>Waktu</th>
        <th>Signature</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Test User</td>
        <td>19/07/2025 10:00</td>
        <td>-</td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`;

const options = {
  pageSize: 'A4',
  orientation: 'Portrait',
  marginTop: '15mm',
  marginBottom: '15mm',
  marginLeft: '15mm',
  marginRight: '15mm',
  encoding: 'UTF-8',
  disableSmartShrinking: true
};

console.log('Starting PDF generation test...');

const buffers = [];
const stream = wkhtmltopdf(html, options);

stream.on('data', (chunk) => {
  buffers.push(chunk);
  console.log(`Received chunk: ${chunk.length} bytes`);
});

stream.on('end', () => {
  try {
    const pdfBuffer = Buffer.concat(buffers);
    console.log(`PDF generated successfully: ${pdfBuffer.length} bytes`);

    // Save test PDF
    const testPath = path.join(__dirname, 'test-output.pdf');
    fs.writeFileSync(testPath, pdfBuffer);
    console.log(`Test PDF saved to: ${testPath}`);
  } catch (error) {
    console.error('Error in end handler:', error);
  }
});

stream.on('error', (error) => {
  console.error('Stream error:', error);
});

setTimeout(() => {
  console.log('Test timeout after 10 seconds');
  process.exit(1);
}, 10000);
