# # 从git拉取最新代码
# git pull

# # 清除旧代码
rm -rf dest
rm -rf dest.zip
# 编译服务器代码 
gulp

# 编译前端代码
npm run build

# 复制文件到执行目录
cp -r public/ dest/public

zip -q -r dest.zip dest
