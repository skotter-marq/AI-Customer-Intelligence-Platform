import { NextResponse } from 'next/server';

export async function GET() {
  // Return a simple HTML page that sets the auth bypass flag
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Development Auth Bypass</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #ddd; border-radius: 8px; }
            .button { background: #0070f3; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; margin: 10px 5px; }
            .button:hover { background: #0051cc; }
            .success { color: #28a745; font-weight: bold; }
            .info { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Development Authentication Bypass</h1>
            <p>This page allows you to bypass authentication for development purposes.</p>
            
            <div class="info">
                <h3>Current Status:</h3>
                <p id="status">Checking...</p>
            </div>

            <button class="button" onclick="enableBypass()">Enable Auth Bypass</button>
            <button class="button" onclick="disableBypass()">Disable Auth Bypass</button>
            <button class="button" onclick="goToApp()">Go to Application</button>

            <div class="info">
                <h3>What this does:</h3>
                <ul>
                    <li>Sets a localStorage flag to bypass authentication</li>
                    <li>Only works in development environment</li>
                    <li>Allows access to all pages without login</li>
                </ul>
            </div>
        </div>

        <script>
            function checkStatus() {
                const bypass = localStorage.getItem('auth_bypass');
                const statusEl = document.getElementById('status');
                if (bypass === 'true') {
                    statusEl.innerHTML = '<span class="success">✅ Auth bypass is ENABLED</span>';
                } else {
                    statusEl.innerHTML = '❌ Auth bypass is DISABLED';
                }
            }

            function enableBypass() {
                localStorage.setItem('auth_bypass', 'true');
                checkStatus();
                alert('Auth bypass enabled! You can now access the application.');
            }

            function disableBypass() {
                localStorage.removeItem('auth_bypass');
                checkStatus();
                alert('Auth bypass disabled.');
            }

            function goToApp() {
                window.location.href = '/meetings';
            }

            // Check status on load
            checkStatus();
        </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}