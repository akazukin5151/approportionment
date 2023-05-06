Download the BLT files from urls.txt and extract the zip files to this dir

```sh
wget $(cat urls.txt)
unzip 'CHttpHandler.ashx*'
```

For developers: if a file needs to be committed to git in this dir, ensure it is whitelist in the .gitignore file in this dir
