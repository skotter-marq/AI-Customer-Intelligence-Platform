// lib/hubspot.js
const { Client } = require('@hubspot/api-client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class HubSpotIntegration {
  
  async syncContacts(limit = 10) {
    try {
      console.log('Syncing HubSpot contacts...');
      
      // Get contacts from HubSpot
      const contactsResponse = await hubspotClient.crm.contacts.basicApi.getPage(limit);
      
      for (const contact of contactsResponse.results) {
        const contactData = {
          hubspot_contact_id: contact.id
        };
        
        // Insert/update in Supabase
        const { data, error } = await supabase
          .from('hubspot_contacts')
          .upsert(contactData, { onConflict: 'hubspot_contact_id' });
        
        if (error) {
          console.error('Error syncing contact:', error);
        } else {
          console.log(`✅ Synced contact: ${contact.properties.firstname} ${contact.properties.lastname}`);
        }
      }
      
      return { success: true, count: contactsResponse.results.length };
      
    } catch (error) {
      console.error('HubSpot sync error:', error);
      return { success: false, error: error.message };
    }
  }
  
  async syncDeals(limit = 10) {
    try {
      console.log('Syncing HubSpot deals...');
      
      const dealsResponse = await hubspotClient.crm.deals.basicApi.getPage(limit);
      
      for (const deal of dealsResponse.results) {
        const dealData = {
          hubspot_deal_id: deal.id,
          deal_name: deal.properties.dealname,
          deal_stage: deal.properties.dealstage,
          deal_amount: deal.properties.amount ? parseFloat(deal.properties.amount) : null,
          close_date: deal.properties.closedate
        };
        
        const { data, error } = await supabase
          .from('hubspot_deals')
          .upsert(dealData, { onConflict: 'hubspot_deal_id' });
        
        if (error) {
          console.error('Error syncing deal:', error);
        } else {
          console.log(`✅ Synced deal: ${deal.properties.dealname}`);
        }
      }
      
      return { success: true, count: dealsResponse.results.length };
      
    } catch (error) {
      console.error('HubSpot deals sync error:', error);
      return { success: false, error: error.message };
    }
  }
  
  async testConnection() {
    try {
      const response = await hubspotClient.crm.contacts.basicApi.getPage(1);
      return { 
        success: true, 
        message: 'HubSpot connection successful!',
        contactCount: response.total || 0
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

module.exports = HubSpotIntegration;