#!/bin/sh

sed -ie "s/localhost/$1/g" server.js
sed -ie "s/localhost/$1/g" test/test.js
echo "changed host to $1"
