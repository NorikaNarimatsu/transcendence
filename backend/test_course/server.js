import http from 'http'
import fs from 'fs/promises';
import url from 'url';
import path from 'path';
const PORT = process.env.PORT;

// // get current path
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// console.log(__filename, __dirname);

const server = http.createServer(async(req, res) => {
    // res.write('Hellow World!');
    // res.setHeader('Content-Type', 'text/html');
    // // res.statusCode = 404;
    // res.writeHead(500, { 'Content-type': 'application/json'});
    // res.end(JSON.stringify({ message: 'Server Error'}));

    // console.log(req.url);
    // console.log(req.method);

    try {
        if (req.method == "GET")
        {
            let filePath;
            if (req.url === '/'){
        // res.writeHead(200, { 'Content-type': 'text/html'});
        // res.end('<h1>Homepage</h1>');
           filePath = path.join(__dirname, 'public', 'index.html');
        } else if (req.url === '/about'){
            // res.writeHead(200, { 'Content-type': 'text/html' });
            // res.end('<h2>ABOUT!</h2>');
            filePath = path.join(__dirname, 'public', 'about.html');
        }
        else {
            throw new Error('Not found');
        }
        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-type': 'text/html' });
        res.write(data);
        res.end;
        }
        else
        {
            throw new Error('Method not Allowed');
        }
    } catch (error) {
        res.writeHead(500, { 'Content-type': 'text/plain' });
        res.end('Server Error');
    }

});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});