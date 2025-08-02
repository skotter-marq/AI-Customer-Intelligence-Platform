// Email templates for changelog subscriptions

export interface ChangelogEmailData {
  subscriber_email: string;
  subscriber_name?: string;
  unsubscribe_token: string;
  updates: {
    id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    highlights: string[];
    release_date: string;
    external_link?: string;
  }[];
}

export function generateChangelogEmailHTML(data: ChangelogEmailData): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Marq Product Updates</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
        .container { 
          max-width: 600px;
          margin: 0 auto;
          background: white;
          padding: 40px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #f3f4f6;
          padding-bottom: 30px;
          margin-bottom: 40px;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #6b7280;
          font-size: 16px;
        }
        .update-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
          background: #fefefe;
        }
        .update-date {
          font-size: 12px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 4px 12px;
          border-radius: 12px;
          display: inline-block;
          margin-bottom: 16px;
        }
        .update-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 12px;
          line-height: 1.4;
        }
        .update-description {
          color: #4b5563;
          margin-bottom: 16px;
        }
        .tags {
          margin-bottom: 16px;
        }
        .tag {
          display: inline-block;
          background: #dbeafe;
          color: #1e40af;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin-right: 8px;
          margin-bottom: 4px;
        }
        .tag.category {
          background: #dcfce7;
          color: #166534;
        }
        .highlights {
          background: #f8fafc;
          border-left: 3px solid #3b82f6;
          padding: 16px;
          margin: 16px 0;
        }
        .highlights ul {
          margin: 0;
          padding-left: 20px;
        }
        .highlights li {
          margin-bottom: 4px;
        }
        .cta-button {
          display: inline-block;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          margin-top: 16px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 2px solid #f3f4f6;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }
        .unsubscribe {
          color: #9ca3af;
          text-decoration: none;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">marq</div>
          <div class="subtitle">Product Updates</div>
        </div>

        <p>Hi${data.subscriber_name ? ` ${data.subscriber_name}` : ''},</p>
        <p>Here are the latest updates from the Marq platform:</p>

        ${data.updates.map(update => `
          <div class="update-card">
            <div class="update-date">
              ${new Date(update.release_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            
            <h2 class="update-title">${update.title}</h2>
            
            <div class="tags">
              <span class="tag category">${update.category}</span>
              ${update.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            
            <p class="update-description">${update.description}</p>
            
            ${update.highlights.length > 0 ? `
              <div class="highlights">
                <strong>Key highlights:</strong>
                <ul>
                  ${update.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${update.external_link ? `
              <a href="${update.external_link}" class="cta-button">Learn More</a>
            ` : ''}
            
            <a href="${baseUrl}/public-changelog#${update.id}" class="cta-button" style="margin-left: 12px;">View Full Update</a>
          </div>
        `).join('')}

        <div class="footer">
          <p>Stay updated with the latest Marq platform improvements.</p>
          <p>
            <a href="${baseUrl}/public-changelog" style="color: #3b82f6;">View All Updates</a> |
            <a href="${baseUrl}/api/unsubscribe?token=${data.unsubscribe_token}" class="unsubscribe">Unsubscribe</a>
          </p>
          <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
            © ${new Date().getFullYear()} Marq. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateChangelogEmailText(data: ChangelogEmailData): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return `
MARQ PRODUCT UPDATES

Hi${data.subscriber_name ? ` ${data.subscriber_name}` : ''},

Here are the latest updates from the Marq platform:

${data.updates.map(update => `
▪ ${update.title}
  Released: ${new Date(update.release_date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}
  Category: ${update.category}
  Tags: ${update.tags.join(', ')}
  
  ${update.description}
  
  ${update.highlights.length > 0 ? `
  Key highlights:
  ${update.highlights.map(highlight => `  • ${highlight}`).join('\n')}
  ` : ''}
  
  View full update: ${baseUrl}/public-changelog#${update.id}
  ${update.external_link ? `Learn more: ${update.external_link}` : ''}

`).join('\n---\n')}

View all updates: ${baseUrl}/public-changelog
Unsubscribe: ${baseUrl}/api/unsubscribe?token=${data.unsubscribe_token}

© ${new Date().getFullYear()} Marq. All rights reserved.
  `.trim();
}