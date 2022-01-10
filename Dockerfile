# 選擇node:alpine
FROM node:14

# 指定預設/工作資料夾
WORKDIR /gameFishing

# copy 指定檔案及資料夾進container
COPY package.json .
# 安裝dependencies
RUN npm install

COPY . ./

EXPOSE 3000

# 指定啟動container後執行命令
CMD ["npm", "start"]