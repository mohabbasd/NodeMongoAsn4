/******************************************************************************
***
* ITE5315 – Assignment 4
* I declare that this assignment is my own work in accordance with Humber Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Mohammad Abbas Student ID: N01579722 Date: 25th March, 2024
*
*
******************************************************************************
**/




var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');

var database = require('./config/database');
var Product = require('./models/productData');

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// Connect to MongoDB
mongoose.connect(database.url, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;

// Read data from JSON file and insert into MongoDB
var filePath = path.join(__dirname, 'datasetB.json');
fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
        console.error('Error reading JSON file:', err);
        return;
    }
    var products = JSON.parse(data);
    Product.insertMany(products)
        .then(() => {
            console.log('Data inserted successfully');
        })
        .catch(err => {
            console.error('Error inserting data into MongoDB:', err);
        });
});

// REST API endpoints

// Get all products
app.get('/api/products', function (req, res) {
    Product.find({})
        .then(products => {
            res.json(products);
        })
        .catch(err => {
            res.status(500).send(err);
        });
});

// Get a product by ID
app.get('/api/products/:product_id', function (req, res) {
    let product_id = req.params.product_id;
    Product.findOne({ asin: product_id })
        .then(product => {
            if (product) {
                res.json(product);
            } else {
                res.status(404).send('Product not found');
            }
        })
        .catch(err => {
            res.status(500).send(err);
        });
});

// Insert a new product
app.post('/api/products', function (req, res) {
    Product.create(req.body)
        .then(product => {
            res.json(product);
        })
        .catch(err => {
            res.status(500).send(err);
        });
});

// Update title and price of an existing product
app.put('/api/products/:product_id', function (req, res) {
    let product_id = req.params.product_id;
    Product.findOneAndUpdate({ asin: product_id }, { title: req.body.title, price: req.body.price }, { new: true })
        .then(product => {
            if (product) {
                res.json(product);
            } else {
                res.status(404).send('Product not found');
            }
        })
        .catch(err => {
            res.status(500).send(err);
        });
});

// Delete a product by ID
app.delete('/api/products/:product_id', function (req, res) {
    let product_id = req.params.product_id;
    Product.findOneAndDelete({ asin: product_id })
        .then(product => {
            if (product) {
                res.json({ message: 'Product deleted successfully' });
            } else {
                res.status(404).send('Product not found');
            }
        })
        .catch(err => {
            res.status(500).send(err);
        });
});


app.get('/api/products/search/:title', function (req, res) {
    let searchTitle = req.params.title;
    // Use regular expression for case-insensitive search
    let regex = new RegExp(searchTitle, 'i');
    Product.find({ title: regex })
        .then(products => {
            if (products.length > 0) {
                res.json(products);
            } else {
                res.status(404).send('No products found matching the search criteria');
            }
        })
        .catch(err => {
            res.status(500).send(err);
        });
});


// Start the server
app.listen(port, function () {
    console.log('App listening on port ' + port);
});

