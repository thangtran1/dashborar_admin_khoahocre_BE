export const newUserNotificationTemplate = (
  userName: string,
  userEmail: string,
  temporaryPassword: string,
  loginUrl: string,
  createdAt: string,
) => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chào mừng bạn đến với hệ thống</title>
        <style>
            body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
                background-color: #d1d1d1;
                color: #111827;
                line-height: 1.5;
            }
            a {
                text-decoration: none;
                color: inherit;
            }

            /* Khung chính */
            .container {
                max-width: 700px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
            }
            .content {
                padding: 24px;
            }

            /* Header */
            .header {
                width: 100%;
                border-bottom: 1px solid #006840;
                padding-bottom: 16px;
            }
            .header img {
                display: block;
                border: none;
            }
            .header .title {
                margin: 0;
                font-size: 24px;
                color: #006840;
            }
            .header .subtitle {
                margin: 4px 0 0;
                font-size: 14px;
                color: #111827;
            }
            .header .icon {
                text-align: right;
            }

            /* Văn bản chào / giới thiệu */
            .intro,
            .intro p {
                margin: 8px 0;
                font-size: 14px;
            }
            .intro p:first-of-type {
                margin-top: 16px;
            }
            .intro p:last-of-type {
                margin-bottom: 16px;
            }

            /* Tiêu đề phần thông tin */
            .section-title {
                margin: 0;
                font-size: 20px;
                color: #006840;
                text-align: center;
            }
            .section-subtitle {
                margin: 4px 0 24px;
                font-size: 14px;
                color: #006840;
                text-align: center;
            }

            /* Bảng thông tin */
            .info-table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                margin-bottom: 24px;
            }
            .info-table colgroup col:first-child {
                width: 35%;
            }
            .info-table colgroup col:last-child {
                width: 65%;
            }
            .info-table td {
                padding: 8px;
                font-size: 14px;
                vertical-align: middle;
                border: 1px solid #d1d5db;
            }
            .info-table td.label {
                font-weight: bold;
                vertical-align: top;
            }

            /* Nút call-to-action */
            .btn-wrapper {
                text-align: center;
                margin-bottom: 24px;
            }
            .btn-wrapper .btn-login {
                display: block;
                width: 100%;
                max-width: 204px;
                height: 26px;
                padding: 12px 0;
                margin: 16px auto 0;
                background: #00a65a;
                color: #fff;
                font-size: 15px;
                font-weight: bold;
                text-align: center;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                text-decoration: none;
            }
            .btn-wrapper a:hover {
                opacity: 0.5;
            }

            /* Chú thích cuối */
            .note {
                margin: 0 0 8px;
                font-size: 12px;
                color: #555;
            }
            .instructions {
                margin: 0 0 8px;
                font-size: 12px;
                color: #555;
            }
            .instructions ul {
                margin: 0 0 8px 16px;
                padding: 0;
            }
            .instructions li {
                margin-bottom: 4px;
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='content'>
                <!-- Header -->
                <table class='header' cellpadding='0' cellspacing='0' border='0' width='100%'>
                <!-- Logo row -->
                <tr>
                    <td style='padding: 16px 0'>
                    <img src='  ' alt='TVT-Admin Logo' width='161' height='31' style='display: block' />
                    </td>
                </tr>

                <!-- Title + subtitle row -->
                <tr>
                    <td>
                    <h1 class='title' style='margin: 0; font-size: 24px; color: #006840'>THÔNG BÁO</h1>
                    <p class='subtitle' style='margin: 4px 0 0; font-size: 16px; color: #333'>
                        Chào mừng Quý khách! Thông tin đăng nhập tài khoản của bạn
                    </p>
                    </td>
                </tr>
                </table>

                <!-- Intro -->
                <div class='intro'>
                <p>Kính gửi Quý khách,</p>
                <p>
                    Công ty TVT-Admin chân thành cảm ơn Quý khách đã tin tưởng và lựa chọn sử dụng dịch vụ của
                    chúng tôi!
                </p>
                <p>Ngay bây giờ, Quý khách có thể thực hiện và trải nghiệm các dịch vụ tại TVT-Admin!</p>
                </div>

                <!-- Section Title -->
                <h2 class='section-title'>THÔNG TIN ĐĂNG KÝ TÀI KHOẢN</h2>
                <p class='section-subtitle'>(Account Registration Information)</p>

                <!-- Info Table -->
                <table class='info-table' cellpadding='0' cellspacing='0' border='0'>
                <colgroup>
                    <col />
                    <col />
                </colgroup>
                <tr>
                    <td class='label'>
                    Ngày, giờ thực hiện<br />
                    <span style='font-weight: normal; font-size: 12px'>Trans. Date, Time</span>
                    </td>
                    <td>${createdAt}</td>
                </tr>
                <tr>
                    <td class='label'>
                    Tên Đăng Nhập<br />
                    <span style='font-weight: normal; font-size: 12px'>Username</span>
                    </td>
                    <td style='color: #006840; font-weight: 900; font-size: 14px'>${userEmail}</td>
                </tr>
                <tr>
                    <td class='label'>
                    Mật khẩu<br />
                    <span style='font-weight: normal; font-size: 12px'>Password</span>
                    </td>
                    <td style='color: #006840; font-weight: 900; font-size: 14px'>${temporaryPassword}</td>
                </tr>
                <tr>
                    <td class='label'>Họ tên người dùng<br />
                    <span style='font-weight: normal; font-size: 12px'>Full Name</span>
                    </td>
                    <td>${userName}</td>
                </tr>
                <tr>
                    <td class='label'>Địa chỉ email<br />
                    <span style='font-weight: normal; font-size: 12px'>Email Address</span>
                    </td>
                    <td>${userEmail}</td>
                </tr>
                </table>

                <!-- Button -->
                <div class='btn-wrapper'>
                <a href='${loginUrl}' class='btn-login'>Đăng nhập ngay</a>
                </div>

                <!-- Notes -->
                <p class='note'>Cảm ơn Quý khách đã sử dụng dịch vụ của TVT-Admin!</p>
                <p class='note'>Lưu ý: Quý khách vui lòng thay đổi mật khẩu sau khi đăng nhập lần đầu.</p>
                <div class='instructions'>
                <p>Để đảm bảo an toàn của tài khoản, Quý khách hãy thực hiện theo đúng hướng dẫn:</p>
                <ul>
                    <li>
                    Bước 1: Truy cập website:
                    <a
                        href='${loginUrl}'
                        style='color: #006840; text-decoration: underline'
                    >vanthang.io.vn</a>
                    </li>
                    <li>Bước 2: Đăng nhập tài khoản.</li>
                    <li>Bước 3: Thay đổi mật khẩu lần đầu.</li>
                </ul>
                </div>
                <p class='note'>
                Đây là email tự động. Quý khách vui lòng không phản hồi (reply) email này. Nếu cần hỗ trợ, Quý khách vui lòng
                chat với TVT-Admin Bot (trên ứng dụng TVT-Admin, website và fanpage chính thức của TVT-Admin); gọi điện đến hotline hoặc
                ứng dụng Telegram.
                </p>
            </div>
            </div>
    </body>
    </html>
  `;
};
