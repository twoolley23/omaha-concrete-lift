'use strict';

const fs = require('fs');
const path = require('path');

const contentPath = path.join(__dirname, '..', '..', 'content', 'site-content.json');
const raw = fs.readFileSync(contentPath, 'utf8');
const content = JSON.parse(raw);

module.exports = content;
