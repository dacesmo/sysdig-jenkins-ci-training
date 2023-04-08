# Sysdig Jenkins CI Training

Place this repo in your Jenkins Pipeline to execute a basic CI integrating Sysdig after build time.

![image](https://user-images.githubusercontent.com/51164449/230702695-dd3d4605-cf37-4e57-93a4-db1fdbe69a57.png)

### Requirements:
* A Jenkins instance with access to GitHub.com (need to retrieve Jenkinsfile, otherwise, copy and paste the code. Might need adjustments).
* Sysdig Secure API Credentials or a Sysdig Service Account with enough permissions to perform scanning.
* Container registry credentials (if using different from GitHub then it might need pipeline modifications).
* Jenkins Pipeline Plugin Installed (and or access to download Sysdig's inline scanner).
* A running worker to execute your pipelines that can:
   * Build Docker images.
   * Execute git clone and checkout.
   * Publish Docker images.

Questions? 
Open [an issue](https://github.com/dacesmo/sysdig-jenkins-ci-training/issues) or [contact me](https://github.com/dacesmo) directly.

Want to contribute?
Create your branch and PR.
