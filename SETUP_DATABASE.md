# Database Setup Instructions

The competitors table doesn't exist yet. Here's how to create it:

## Option 1: Quick Setup (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `yipbkonxdnlpvororuau`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Create Competitors Table**
   Copy and paste this SQL:

```sql
-- Create competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  description TEXT,
  website_url VARCHAR(500),
  logo_url VARCHAR(500),
  market_cap VARCHAR(50),
  employees VARCHAR(50),
  founded_year INTEGER,
  headquarters VARCHAR(200),
  threat_level VARCHAR(20) CHECK (threat_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'monitoring', 'archived')) DEFAULT 'active',
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(100),
  last_analyzed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_competitors_threat_level ON competitors(threat_level);
CREATE INDEX IF NOT EXISTS idx_competitors_status ON competitors(status);
CREATE INDEX IF NOT EXISTS idx_competitors_industry ON competitors(industry);

-- Insert sample data
INSERT INTO competitors (name, industry, description, website_url, market_cap, employees, threat_level, status, confidence_score, created_by) VALUES
('Salesforce', 'CRM & Sales', 'Leading cloud-based CRM platform with comprehensive sales, marketing, and customer service solutions', 'https://salesforce.com', '$200B+', '70,000+', 'high', 'active', 0.95, 'setup'),
('HubSpot', 'Marketing & CRM', 'Inbound marketing and sales platform with free CRM and comprehensive marketing tools', 'https://hubspot.com', '$25B+', '5,000+', 'high', 'active', 0.92, 'setup'),
('Microsoft Dynamics', 'Business Applications', 'Enterprise-grade CRM and ERP solutions integrated with Microsoft Office ecosystem', 'https://dynamics.microsoft.com', '$3T+', '220,000+', 'medium', 'active', 0.88, 'setup'),
('Pipedrive', 'Sales CRM', 'Sales-focused CRM designed for small and medium businesses with visual pipeline management', 'https://pipedrive.com', '$1.5B+', '1,000+', 'medium', 'active', 0.85, 'setup'),
('Zendesk', 'Customer Service', 'Customer service and engagement platform with ticketing, knowledge base, and chat solutions', 'https://zendesk.com', '$13B+', '6,000+', 'medium', 'active', 0.82, 'setup'),
('Intercom', 'Customer Messaging', 'Conversational relationship platform with live chat, help desk, and marketing automation', 'https://intercom.com', '$1.3B+', '1,500+', 'low', 'monitoring', 0.78, 'setup');

-- Update trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create update trigger
CREATE TRIGGER update_competitors_updated_at 
  BEFORE UPDATE ON competitors 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

4. **Run the SQL**
   - Click "Run" to execute the SQL
   - You should see "Success. No rows returned"

## Option 2: Complete Setup

If you want all tables (competitors, workflows, agents), copy the contents of these files and run them in order:

1. `database/competitors_schema.sql`
2. `database/workflows_schema.sql` 
3. `database/agents_schema.sql`

## Verify Setup

After creating the tables, you can verify by:

1. **Check in Supabase Dashboard**
   - Go to "Table Editor"
   - You should see the "competitors" table with sample data

2. **Test the API**
   - Visit: http://localhost:3000/api/setup-db
   - Should return: `{"tablesExist": true, "message": "Database is ready"}`

3. **Test the App**
   - Go to: http://localhost:3000/competitors
   - Should load without the "relation does not exist" error

## Troubleshooting

If you still see errors:

1. **Check Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://yipbkonxdnlpvororuau.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Check Table Permissions**
   - In Supabase Dashboard → Authentication → Policies
   - Ensure tables have proper RLS policies or are publicly accessible

3. **Check SQL Editor Results**
   - Look for any error messages when running the SQL
   - Common issues: syntax errors, permission issues

## Quick Test

Once done, you can test with:

```bash
curl http://localhost:3000/api/competitors
```

Should return the competitors data instead of an error.