const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const { authenticate, register } = require('./modules/auth');

function serveFile(filePath, contentType, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end('Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/') return serveFile('public/login.html', 'text/html', res);
        if (req.url === '/signup') return serveFile('public/signup.html', 'text/html', res);
        if (req.url === '/style.css') return serveFile('public/style.css', 'text/css', res);
        if (req.url === '/patient-form') return serveFile('views/patient-form.html', 'text/html', res);
        if (req.url === '/appointment-booking') return serveFile('views/appointment-booking.html', 'text/html', res);
        if (req.url === '/success') return serveFile('views/success.html', 'text/html', res);
        res.writeHead(404).end('Not Found');
    } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const data = querystring.parse(body);

            if (req.url === '/login') {
                if (authenticate(data.role, data.username, data.password)) {
                    res.writeHead(302, { Location: '/patient-form' });
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end('<h2>Login Failed. <a href="/">Try again</a></h2>');
                }
                return res.end();
            }

            if (req.url === '/signup') {
                if (register(data.role, data.username, data.password)) {
                    res.end('<h2>Account Created. <a href="/">Login now</a></h2>');
                } else {
                    res.end('<h2>User exists. <a href="/signup">Try again</a></h2>');
                }
            }

            if (req.url === '/patient-info') {
                fs.writeFileSync('patient-info.json', JSON.stringify(data, null, 2));
                res.writeHead(302, { Location: '/appointment-booking' });
                return res.end();
            }

            if (req.url === '/book') {
                fs.writeFileSync('appointment.json', JSON.stringify(data, null, 2));
                res.writeHead(302, { Location: '/success' });
                return res.end();
            }
        });
    }
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});