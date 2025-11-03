# SYSTEM ADMIN Backend – Hướng dẫn cài đặt & khởi chạy (qua scripts)

> Tài liệu này giúp bạn **thiết lập, chạy, deploy** nhanh chóng bằng các lệnh `pnpm`

---

## 1) Yêu cầu hệ thống

- **Git** – [https://git-scm.com/downloads](https://git-scm.com/downloads)
- **Node.js** – **LTS 20.x+**
- **pnpm** – **>= 9.x** (khuyến nghị **10.x**)

  ```bash
  npm i -g pnpm
  ```

---

## 2) Clone & cài đặt phụ thuộc

```bash
git clone https://github.com/thangtran1/dashborar_admin_khoahocre_BE
cd dashborar_admin_khoahocre_BE
pnpm i
```

## 3) Thiết lập môi trường (scripts)

```bash
# 1) Chỉ tạo/cập nhật file .env theo môi trường
pnpm setup-env

# 2) Thiết lập đầy đủ thông tin cho file env khi generated lệnh trên
```

## 4) Chạy theo môi trường

### 4.1 Local (build/run)

```bash
pnpm dev

```

## 5) CSDL & Migration (CLI `migrator`)

```bash
# Kiểm tra DB sẵn sàng
pnpm db:ready

# Khởi tạo seed data cơ bản (tuỳ cấu hình)
pnpm seed

```

---

## 6) Bộ lệnh tiện ích (scripts)

| Lệnh                                            | Chức năng                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| `pnpm build`                                    | Build toàn bộ project NestJS (`nest build`).                                          |
| `pnpm lint`                                     | Chạy ESLint fix code tự động.                                                         |
| `pnpm test`                                     | Chạy Jest unit test.                                                                  |
| `pnpm test:watch`                               | Chạy Jest ở chế độ watch.                                                             |
| `pnpm test:cov`                                 | Chạy Jest và generate coverage report.                                                |
| `pnpm test:debug`                               | Chạy Jest với debug mode, dùng Node inspector.                                        |
| `pnpm test:e2e`                                 | Chạy test E2E theo cấu hình `jest-e2e.json`.                                          |
| `pnpm seed`                                     | Chạy script seed dữ liệu (`src/scripts/seed.ts`) bằng `ts-node`.                      |
| `pnpm clear`                                    | Chạy script clear dữ liệu (`src/scripts/clear.ts`) bằng `ts-node`.                    |
| `pnpm setup-env`                                | Chạy script bash `scripts/setup-env.sh` → tạo/copy `.env`.                            |
| `pnpm db-ready`                                 | Chạy script bash `scripts/db-ready.sh` → kiểm tra MongoDB kết nối.                    |

---

## 7) Sự cố thường gặp – system-admin failed

Khi clone code mới về cập nhật env test connection với database mongose và các env khác có trong env khi chạy lệnh pnpm setup-env

Cách xử lý nhanh (khuyến nghị):

Test connection trực tiếp trên mongose
Test kết nối google and github login trực tiếp trên web

Mẹo: Hãy liên hệ qua email: thangtrandz04@gmail để biết thêm thông tin or liên hệ trực tiếp qua hotline: 0389215396 hoặc thông qua fanpage: vanthang.io.vn để được hỗ trợ
