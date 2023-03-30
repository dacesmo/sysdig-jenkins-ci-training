pipeline {
    agent any
    parameters {
        string(name: "git_repository", defaultValue: "https://github.com/dacesmo/santander-training.git", trim: true, description: "Git Repo to build Dockerfile from")
        string(name: "git_branch", defaultValue: "main", trim: true, description: "Git branch to build Dockerfile from")
        string(name: "docker_tag", defaultValue: "myapp:v1.0.1", trim: true, description: "Docker Image Tag")
        string(name: "sysdig_url", defaultValue: "https://us2.app.sysdig.com", trim: true, description: "Sysdig URL based on Sysdig SaaS region")
        string(name: "registry_url", defaultValue: "ghcr.io/dacesmo", trim: true, description: "Container Registry URL")
    }
    stages {
        stage('Clean Workspace') {  // clean the workspace to avoid old files conflicts
            steps {
                cleanWs()
            }
        }
        stage('Clone repo'){  // clone repo
            steps{
                git branch: "${git_branch}",
                    url: "${git_repository}"
                sh 'uname -a'
            }
        }
        /*stage('Lint Docker'){  // This step is recommended to ensure images standardization
            steps{
                sh "apt install -y wget"
                sh "wget -O ./hadolint https://github.com/hadolint/hadolint/releases/download/v2.12.0/hadolint-Linux-arm64"
                sh "chmod 744 hadolint"
                sh "./hadolint -V Dockerfile"
            }
        }*/
        stage('Build image'){  // Build the image from a Dockerfile
            steps{
                sh "ls -la"
                sh "docker image build --tag jenkins-pipeline/${docker_tag}  --label 'org.opencontainers.image.source=https://github.com/dacesmo/santander-training' . # --label 'stage=PROD'"
            }
        }
        stage('Sysdig Vulnerability Scan'){
            steps{
                withCredentials([string(credentialsId: 'sysdig_secure_api_token', variable: 'secure_api_token')]) {
                    sh 'curl -LO "https://download.sysdig.com/scanning/bin/sysdig-cli-scanner/$(curl -L -s https://download.sysdig.com/scanning/sysdig-cli-scanner/latest_version.txt)/linux/amd64/sysdig-cli-scanner"'
                    sh 'chmod +x ./sysdig-cli-scanner'
                    sh "SECURE_API_TOKEN=${secure_api_token} ./sysdig-cli-scanner --apiurl ${sysdig_url} jenkins-pipeline/${docker_tag}"
                    //sh "SECURE_API_TOKEN=${secure_api_token} ./sysdig-cli-scanner --apiurl ${sysdig_url} --policy my-demo-policy jenkins-pipeline/${docker_tag}"
                }
            }
        }
        stage('Tag Docker Image'){
            steps{
                sh 'docker tag jenkins-pipeline/${docker_tag} ${registry_url}/${docker_tag}'
            }
        }
        stage('Push Docker Image'){
            steps{
                withCredentials([usernamePassword(credentialsId: 'gh_cr_token', usernameVariable: 'username', passwordVariable: 'password')]) {
                    sh 'echo ${password} | docker login ghcr.io -u ${username} --password-stdin'
                    sh 'docker push ${registry_url}/${docker_tag}'
                }
            }
        }
    }
}
