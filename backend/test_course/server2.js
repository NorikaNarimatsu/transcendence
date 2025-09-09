import { createServer } from 'http';
const PORT = process.env.PORT;

const users = [
    {id: 1, name: 'Bla1'} ,
    {id: 2, name: 'Bla2'},
    {id: 3, name: 'Bla3'}
];

const server = createServer((req, res) => {
    if (req.url == '/api/users' && req.method === 'GET')
    {
        res.setHeader('Content-type', 'application/json');
        res.write(JSON.stringify(users));
        res.end();
    }
    else {
        res.setHeader('Content-type', 'application/json');
        res.statusCode = 404
        res.write(JSON.stringify({ message: 'Route not found'}));
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});