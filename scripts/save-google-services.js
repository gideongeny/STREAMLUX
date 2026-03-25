const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../android/app/google-services.json');

const content = `{
  "project_info": {
    "project_number": "242283846154",
    "project_id": "streamlux-67a84",
    "storage_bucket": "streamlux-67a84.firebasestorage.app"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:242283846154:android:1598c6d306a52c26c49df3",
        "android_client_info": {
          "package_name": "com.streamlux.app"
        }
      },
      "oauth_client": [
        {
          "client_id": "242283846154-t9ji7cvhfbobegog438kgdvedf2nq5ra.apps.googleusercontent.com",
          "client_type": 3
        }
      ],
      "api_key": [
        {
          "current_key": "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY"
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": [
            {
              "client_id": "242283846154-t9ji7cvhfbobegog438kgdvedf2nq5ra.apps.googleusercontent.com",
              "client_type": 3
            }
          ]
        }
      }
    }
  ],
  "configuration_version": "1"
}`;

try {
    fs.writeFileSync(targetPath, content);
    console.log('✅ Successfully saved real google-services.json');
} catch (e) {
    console.error('❌ Error saving file:', e);
}
