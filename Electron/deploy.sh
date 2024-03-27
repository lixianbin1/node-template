#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 删除文件
rm -rf out/

# 获取版本号
PACKAGE_VERSION=$(sed 's/.*"version":\s"\(.*\)".*/\1/;t;d' ./package.json)

# 生成静态文件
npm run make
cd out/make/zip/win32/x64

# push
git init
git add -A
git commit -m 'v'$PACKAGE_VERSION
git pull git@github.com:lixianbin1/Electron-Example.git package --allow-unrelated-histories
git tag 'v'$PACKAGE_VERSION
git push git@github.com:lixianbin1/Electron-Example.git master:package

# 删除dist文件夹
cd ../../../../../
rm -rf out/