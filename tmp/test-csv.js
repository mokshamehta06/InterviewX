const https = require('https');

https.get('https://raw.githubusercontent.com/darkflowio/Leetcode-Company-Wise-Questions-Website/master/data/LeetCode-Questions-CompanyWise/amazon_alltime.csv', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = data.split('\n');
    console.log(lines[0]);
    console.log(lines[1]);
  });
});
