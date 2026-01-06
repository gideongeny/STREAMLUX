const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../android/gradle/wrapper/gradle-wrapper.properties');

const content = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-all.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`;

try {
    fs.writeFileSync(targetPath, content);
    console.log('✅ Updated gradle-wrapper.properties to 8.7');
} catch (e) {
    console.error('❌ Error writing wrapper properties:', e);
}
