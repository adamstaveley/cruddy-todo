#!/bin/sh

sed -ie "s/localhost/$1/g" server.js
sed -ie "s/localhost/$1/g" src/index.jsx
sed -ie "s/localhost/$1/g" public/js/bundle.js
