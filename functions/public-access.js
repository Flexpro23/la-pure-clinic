const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Make the Cloud Function public (allows unauthenticated access)
async function makePublic() {
  try {
    const projectId = serviceAccount.project_id;
    const region = 'us-central1';
    const functionName = 'generateNewLook';
    
    console.log(`Making function ${functionName} public in project ${projectId}...`);
    
    // This requires gcloud CLI to be installed and configured
    const { exec } = require('child_process');
    
    // Run the gcloud command to update the IAM policy
    const command = `gcloud functions add-iam-policy-binding ${functionName} --region=${region} --member="allUsers" --role="roles/cloudfunctions.invoker"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
      console.log(`Function is now public: ${stdout}`);
    });
  } catch (error) {
    console.error('Error making function public:', error);
  }
}

makePublic(); 