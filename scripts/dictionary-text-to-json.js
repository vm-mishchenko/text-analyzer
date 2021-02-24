const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('./src/eng_dict.txt'),
  output: process.stdout,
  terminal: false
});

const frequencyMap = {};
let position = 0;
rl.on('line', (line) => {
  const [word, original] = line.split('\t');
  position++;

  if (word === original) {
    frequencyMap[word] = {
      position,
      original,
    }
  } else {
    frequencyMap[word] = {
      position: frequencyMap[original].position,
      original,
    }
  }
});

rl.on('close', () => {
  fs.writeFile("./src/frequency-map.json", JSON.stringify(frequencyMap), 'utf8', function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }

    console.log("JSON file has been saved.");
  });
});
