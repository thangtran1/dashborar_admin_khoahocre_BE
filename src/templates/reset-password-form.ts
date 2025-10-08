export const templateHtml = (resetLink: string, otp: string) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>🔐 Reset Password - KhoaHocRe</title>
  <style>
    body { margin:0; padding:20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #667eea; }
    .container { max-width:500px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding:15px; text-align:center; color:#fff; }
    .logo { font-size:14px; font-weight:bold; }
    .content { padding:20px; text-align:center; }
    .message { font-size:14px; color:#333; margin-bottom:20px; }

    /* OTP */
    .otp-section { background:#e6f7ff; border:2px solid #91d5ff; border-radius:12px; padding:15px; margin-bottom:20px; }
    .otp-label { font-size:14px; font-weight:600; color:#1890ff; margin-bottom:8px; display:block; }
    .otp-code { font-size:24px; font-weight:bold; color:#1890ff; font-family:'Courier New', monospace; background:#fff; padding:10px 15px; border-radius:8px; border:1px solid #91d5ff; display:inline-block; cursor:pointer; user-select:all; }

    /* Reset link */
    .link-section { margin-bottom:20px; text-align:left; }
    .link-label { font-weight:600; color:#722ed1; margin-bottom:8px; display:block; }
    .link-code { display:block; width:100%; word-break:break-all; background:#fff; border:1px solid #d9d9d9; border-radius:8px; padding:10px; color:#722ed1; text-decoration:none; }

    /* Copy section */
    table.copy-section { width:100%; margin-top:10px; border-collapse:collapse; }
    table.copy-section td { vertical-align:middle; }
    .copy-label { font-weight:600; color:#495057; font-size:14px; width:50px; }
    .copy-input { width:100%; padding:6px 10px; border:1px solid #ced4da; border-radius:4px; font-family:monospace; font-size:12px; }
    .copy-btn { background:#28a745; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:600; }

    .security-note { background:#fff7e6; border:1px solid #ffd591; border-radius:8px; padding:15px; margin-top:20px; text-align:left; }
    .security-note h4 { color:#d46b08; font-size:14px; margin-bottom:8px; }
    .security-note p { color:#8c4a00; font-size:12px; margin:0; line-height:1.4; }

    .footer { background:#f8f9fa; padding:20px; text-align:center; border-top:1px solid #e9ecef; }
    .footer-text { color:#6c757d; font-size:12px; }

    @media (max-width:600px){
      .otp-code { font-size:20px; padding:8px 12px; }
      .link-code { font-size:12px; padding:8px 10px; }
      table.copy-section td { display:block; width:100%; margin-bottom:10px; }
      .copy-label { margin-bottom:5px; width:auto; display:block; }
      .copy-btn { width:100%; margin-top:5px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎓 Chia sẻ kiến thức quý giá</div>
    </div>

    <div class="content">
      <div class="message">Nhập mã OTP hoặc click nút bên dưới để reset mật khẩu</div>

      <!-- OTP Section -->
      <div class="otp-section">
        <span class="otp-label">🔐 Mã OTP</span>
        <span class="otp-code" onclick="navigator.clipboard.writeText('${otp}'); alert('OTP đã được copy!')">${otp}</span>
      </div>

      <!-- Reset Link Section -->
      <div style="text-align:left; margin-bottom:20px;">
        <span style="font-weight:600; margin-bottom:5px; color:#722ed1;">🔗 Link Reset Password</span>
        <a href="${resetLink}" target="_blank"
          style="display:block; -top:10px; background:#fff; border:1px solid #d9d9d9; border-radius:8px; padding:10px; word-break:break-all; color:#722ed1; text-decoration:none;">
          ${resetLink}
        </a>
      </div>


      <!-- Copy Section -->
      <table class="copy-section">
        <tr>
          <td class="copy-label">OTP:</td>
          <td><input type="text" class="copy-input" value="${otp}" readonly onclick="this.select()"></td>
          <td><button class="copy-btn" onclick="navigator.clipboard.writeText('${otp}'); alert('Copied OTP!')">Copy</button></td>
        </tr>
        <tr><td colspan="3" style="height:10px;"></td></tr>
        <tr>
          <td class="copy-label">Link:</td>
          <td><input type="text" class="copy-input" value="${resetLink}" readonly onclick="this.select()"></td>
          <td><button class="copy-btn" onclick="navigator.clipboard.writeText('${resetLink}'); alert('Copied Link!')">Copy</button></td>
        </tr>
      </table>

      <!-- Security Note -->
      <div class="security-note">
        <h4>🛡️ Lưu ý</h4>
        <p>
          • Không chia sẻ mã OTP<br>
          • Bỏ qua email nếu không yêu cầu<br>
          • Mã OTP hết hạn sau 15 phút
        </p>
      </div>
    </div>

    <div class="footer">
      <div class="footer-text">Email tự động từ KhoaHocRe</div>
    </div>
  </div>
</body>
</html>
`;
