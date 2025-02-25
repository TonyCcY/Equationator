const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// Serve vendor files correctly
app.use('/vendor/core-js/minified.js', express.static(path.join(__dirname, 'node_modules/core-js-bundle/minified.js')));
app.use('/vendor/mathjax', express.static(path.join(__dirname, 'node_modules/mathjax/es5')));

// Set proper MIME types
app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
        res.type('application/javascript');
    }
    next();
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Equationator running at http://localhost:${port}`);
}); 