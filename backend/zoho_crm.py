from ZCRMSDK import ZCRMClient, ZohoOAuth
import os

# Instructions to obtain Zoho CRM API credentials:
# 1. Go to Zoho API Console: https://api-console.zoho.com/
# 2. Click on 'GET STARTED' or 'Add Client'.
# 3. Choose 'Server-based Applications'.
# 4. Fill in the Client Name, Homepage URL (e.g., http://localhost:8000), and Authorized Redirect URIs (e.g., http://localhost:8000/oauth/callback).
# 5. Click 'CREATE'. You will get Client ID and Client Secret.
# 6. To get the Refresh Token, construct an authorization URL:
#    https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.users.ALL,ZohoCRM.modules.ALL&client_id={client_id}&response_type=code&access_type=offline&redirect_uri={redirect_uri}
#    Replace {client_id} and {redirect_uri} with your values. Open this URL in a browser, authorize, and you'll get a grant token (code) in the redirect URL.
# 7. Use this grant token to get the Refresh Token:
#    curl -X POST "https://accounts.zoho.com/oauth/v2/token?code={grant_token}&client_id={client_id}&client_secret={client_secret}&redirect_uri={redirect_uri}&grant_type=authorization_code"
#    The response will contain the refresh_token.

# Configure Zoho CRM SDK
# Replace with your actual credentials or load from environment variables
CLIENT_ID = os.getenv("ZOHO_CLIENT_ID", "YOUR_ZOHO_CLIENT_ID")
CLIENT_SECRET = os.getenv("ZOHO_CLIENT_SECRET", "YOUR_ZOHO_CLIENT_SECRET")
REFRESH_TOKEN = os.getenv("ZOHO_REFRESH_TOKEN", "YOUR_ZOHO_REFRESH_TOKEN")
REDIRECT_URI = os.getenv("ZOHO_REDIRECT_URI", "http://localhost:8000/oauth/callback")

# Initialize Zoho SDK
# This will create a zoho_oauth_tokens.txt file to store tokens
def initialize_zoho_sdk():
    configuration = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "accounts_url": "https://accounts.zoho.com",
        "token_persistence_path": ".", # Current directory for token storage
        "current_user_email": "your_admin_email@example.com" # Replace with an admin email
    }
    ZohoOAuth.initialize(configuration)
    # Generate and store access token using refresh token
    ZohoOAuth.get_instance().generate_access_token_from_refresh_token(REFRESH_TOKEN, configuration["current_user_email"])

# Function to create a user (contact) in Zoho CRM
def create_zoho_contact(email, first_name="", last_name=""):
    try:
        initialize_zoho_sdk()
        contact_module = ZCRMClient.get_instance().get_module("Contacts")
        contact_record = ZCRMClient.get_instance().get_record("Contacts")
        contact_record.set_field_value("Email", email)
        contact_record.set_field_value("First_Name", first_name)
        contact_record.set_field_value("Last_Name", last_name)

        response = contact_module.create_records([contact_record])
        if response.get_status_code() == 200:
            print(f"Contact {email} created in Zoho CRM.")
            return True
        else:
            print(f"Failed to create contact {email} in Zoho CRM: {response.get_message()}")
            return False
    except Exception as e:
        print(f"Error creating Zoho CRM contact: {e}")
        return False