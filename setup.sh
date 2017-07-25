#!/bin/sh

sed -ie "s/localhost/$1/g" server.js
echo "changed host to $1"
