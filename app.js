const http = require('http');
const fs = require('fs')

const hostname = '0.0.0.0';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  fs.readFile("./mydata.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      //return;
      const printme = "Default"
      res.end(printme)
    }
    const printme = jsonString
    res.end(printme)
  });

});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
