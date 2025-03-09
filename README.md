# group-web-project

# Hướng dẫn chạy dự án

### 1. Tải Node.js

- Để chạy dự án, hãy tải và cài đặt **Node.js** từ [trang chủ Node.js](https://nodejs.org/).

### 2. Cài đặt thư viện

- Vào từng thư mục **backend** và **frontend** để cài đặt các thư viện cần thiết.
- Trong terminal, điều hướng đến mỗi thư mục và chạy lệnh sau:

```bash
cd backend
npm install

cd frontend
npm install
```

### 3. Cấu hình database

- Cấu hình lại database trong file backend/src/config/connectDB.js (Hãy tải my sql nếu chưa có)

- Sử dụng lệnh npx sequelize-cli db:migrate để tạo tablet trong my sql từ thư mục **backend**

### 4. Chạy dự án

- Chạy song song 2 backend và frontend bằng 2 terminal với back sử dụng npm start còn front dùng yarn dev

```bash
# Chạy backend
cd backend
npm start

# Chạy frontend
cd ../frontend
yarn dev
```

- Lưu ý: Bạn cần chắc chắn đã cài đặt `yarn` để chạy frontend với lệnh `yarn dev`.
