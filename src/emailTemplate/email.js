const emailTemplate = (staffName) => `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
            <h1>Welcome to Our Team!</h1>
        </div>

        <!-- Body -->
        <div style="padding: 20px; color: #333;">
            <h2>Hello, ${staffName}!</h2>
            <p>We're excited to have you on board.</p>
            <p>Feel free to reach out if you have any questions.</p>
            <br>
            <p>Best Regards,</p>
            <p><strong>Company Team</strong></p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>&copy; ${new Date().getFullYear()} Company Name. All rights reserved.</p>
            <p><a href="https://yourcompany.com" style="color: #007bff; text-decoration: none;">Visit our website</a></p>
        </div>

    </div>
`;


const OtpTemplate = (otpCode) => `
  <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">

    <!-- Header -->
    <div style="background-color: #bec1c1; color: white; padding: 20px; text-align: center;">
      <h1>Verification Code</h1>
    </div>

    <!-- Body -->
    <div style="padding: 20px; color: #333;">
      <p>Use the following One-Time Password (OTP) to verify your account:</p>

      <div style="margin: 20px 0; padding: 15px; background-color: #f1f1f1; font-size: 24px; text-align: center; border-radius: 6px; position: relative;">
        <span id="otp-code" style="letter-spacing: 4px; font-weight: bold;">${otpCode}</span>
        <span onclick="copyOTP()" title="Copy OTP" style="cursor: pointer; position: absolute; right: 15px; top: 50%; transform: translateY(-50%); font-size: 18px; color: #007bff;">🗐</span>
      </div>

      <p>This code is valid for 10 minutes. Do not share it with anyone.</p>
      <br>
      <p>Best Regards,</p>
      <p><strong>Company StockCheck</strong></p>
    </div>

    <!-- Footer -->
    <div style="background-color:#FFD68A; padding: 15px; text-align: center; font-size: 12px; color: #666;">
      <p>&copy; ${new Date().getFullYear()} Company Name. All rights reserved.</p>
    </div>

    <!-- Optional JS for copy functionality -->
    <script>
      function copyOTP() {
        const otpText = document.getElementById('otp-code').innerText;
        navigator.clipboard.writeText(otpText).then(() => {
          alert('OTP copied to clipboard');
        }).catch(err => {
          alert('Failed to copy OTP');
        });
      }
    </script>

  </div>
`;

const saleTemplate = (saleDetails) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sales Report</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
      :root {
        --light: #ffffff;
        --primary: #FFD68A;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Poppins', sans-serif;
      }

      body {
        background-color: #f3f3f7;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      header {
        background-color: var(--primary);
        padding: 5px 10px;
        text-align: left;
      }

      header h3 {
        font-size: 18px;
        font-weight: 600;
      }

      .user-info {
        background-color: #f8f7fe;
        display: flex;
        justify-content: flex-end;
        padding: 10px;
      }

      .user-info p {
        font-size: 14px;
        margin: 2px 0;
      }

      .user-info p:first-child {
        font-weight: 800;
        text-transform: uppercase;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }

      th, td {
        padding: 10px 5px;
        text-align: center;
        font-size: 14px;
      }

      th {
        background-color: var(--primary);
        font-weight: 600;
        text-transform: capitalize;
      }

      tr:nth-child(even) {
        background-color: #bec1c1;
      }

      .total-section {
        text-align: right;
        padding: 10px 15px;
        font-weight: 600;
      }

      footer {
        background-color: var(--primary);
        display: grid;
        place-items: center;
        padding: 10px;
        font-size: 14px;
        font-weight: 500;
      }

      footer span {
        font-weight: 800;
        padding: 0 10px;
      }
    </style>
  </head>
  <body>
    <header>
      <h3>Sales Report</h3>
    </header>

    <div class="user-info">
      <div>
        <p>${saleDetails?.name}</p>
        <p>${saleDetails?.storeName}</p>
        <p>${saleDetails?.email}</p>
        <p>${saleDetails?.number}</p>
      </div>
    </div>

    <main>
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Month</th>
            <th>Sale Price</th>
            <th>Year</th>
          </tr>
        </thead>
        <tbody>
          ${saleDetails?.data?.map((value, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${value['month']}</td>
              <td>${value['totalSales']}</td>
              <td>${value['year']}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="total-section">
        Total Revenue ₹: ${saleDetails?.total}
      </div>
    </main>

    <footer>
      <p>Thank you for choosing <span>Stockcheck</span></p>
    </footer>
  </body>
</html>
`





module.exports = { emailTemplate, OtpTemplate, saleTemplate }