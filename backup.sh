#!/bin/sh
ls /
cd /wikiteam3/wikiteam3

rm -r /pokeclicker-wiki-backup/data-dump
mkdir /pokeclicker-wiki-backup/data-dump
#dumpgenerator --xmlrevisions --xml --api=https://pokeclicker.miraheze.org/w/api.php --path=/pokeclicker-wiki-backup/data-dump

cd /pokeclicker-wiki-backup
npm start

git add .
git commit -am "updated data"

