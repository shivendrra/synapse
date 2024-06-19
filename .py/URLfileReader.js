const fs = require('fs');

// file path
const jsonFilePath = './file/URLfile.json';

// read the json file
fs.readFile(jsonFilePath, 'utf-8', (err, data) => {
  if(err){
    console.error('error reading the file', err);
    return;
  }
  try {
    const jsonObject = JSON.parse(data);
    console.log('JSON data as an object:', jsonObject);
  }
  catch (jsonError) {
    console.error('Error parsing JSON:', jsonError);
  }
});