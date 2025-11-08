export const templateHtml = (resetLink: string, otp: string) => {
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
            .header {
                width: 100%;
                border-bottom: 1px solid #006840;
                padding-bottom: 16px;
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
            .intro, .intro p {
                margin: 8px 0;
                font-size: 14px;
            }
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
            .info-table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                margin-bottom: 24px;
                word-break: break-all;
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
            .open-btn {
                margin-top: 8px;
                display: inline-block;
                padding: 8px 16px;
                background-color: #ffffff;
                color: #006840;
                border: 1px solid #006840;
                border-radius: 4px;
                text-decoration: none;
                font-size: 14px;
            }
            .open-btn:hover {
                background-color: #f0fdf4;
            }
            .note {
                margin: 0 0 8px;
                font-size: 12px;
                color: #555;
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='content'>
                <table class='header' cellpadding='0' cellspacing='0' border='0' width='100%'>
                <tr>
                    <td>
                    <h1 class='title'>THÔNG BÁO</h1>
                    <p class='subtitle'>Thông tin đặt lại mật khẩu tài khoản của bạn</p>
                    </td>
                </tr>
                </table>

                <div class='intro'>
                <p>Kính gửi Quý khách,</p>
                <p>Công ty TVT-Admin chân thành cảm ơn Quý khách đã tin tưởng và lựa chọn dịch vụ của chúng tôi!</p>
                <p>Ngay bây giờ, Quý khách có thể thực hiện và trải nghiệm các dịch vụ tại TVT-Admin!</p>
                </div>

                <h2 class='section-title'>THÔNG TIN ĐẶT LẠI MẬT KHẨU</h2>
                <p class='section-subtitle'>(Reset Password Information)</p>

                <table class='info-table' cellpadding='0' cellspacing='0' border='0'>
                <colgroup>
                    <col />
                    <col />
                </colgroup>
                <tr>
                    <td class='label'>Mã OTP</td>
                    <td>${otp}</td>
                </tr>
                <tr>
                    <td class='label'>Link Reset Password</td>
                    <td>
                      ${resetLink}
                      <br/>
                      <a class="open-btn" href="${resetLink}" target="_blank">Mở Link</a>
                    </td>
                </tr>
                </table>

                <p class='note'>Cảm ơn Quý khách đã sử dụng dịch vụ của TVT-Admin!</p>
                <p class='note'>Lưu ý: Quý khách vui lòng không chia sẻ mã OTP cho bất kỳ ai.</p>
                <p class='note'>Email tự động, vui lòng không reply.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
