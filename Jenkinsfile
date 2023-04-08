pipeline {
    agent any
    parameters {  // Defines Parameters as Code
        string(name: "git_repository", defaultValue: "https://github.com/dacesmo/santander-training.git", trim: true, description: "Git Repo to build Dockerfile from")
        string(name: "git_branch", defaultValue: "main", trim: true, description: "Git branch to build Dockerfile from")
        string(name: "docker_tag", defaultValue: "myapp:v1.0.1", trim: true, description: "Docker Image Tag")
        string(name: "sysdig_url", defaultValue: "https://us2.app.sysdig.com", trim: true, description: "Sysdig URL based on Sysdig SaaS region")
        string(name: "registry_url", defaultValue: "ghcr.io/dacesmo", trim: true, description: "Container Registry URL")
        string(name: "sysdig_cli_args", defaultValue: "", trim: true, description: "Optional args for Sysdig CLI Scanner")
        string(name: "plugin_policies_to_apply", defaultValue: "", description: "List of policies to apply (Plugin execution only)")
        booleanParam(name: 'sysdig_plugin', defaultValue: true, description: 'Want to use Sysdig Plugin? (Plugin execution only)')
        booleanParam(name: 'bail_on_plugin', defaultValue: true, description: 'Want Sysdig to Bail on Fail? (Plugin execution only)')
        booleanParam(name: 'bail_on_plugin_fail', defaultValue: true, description: 'Want Sysdig to Bail on Plugin Fail? (Plugin execution only)')
        
        

    }
    stages {
        stage('Clean Workspace') {  // Cleans the workspace to avoid old files conflicts
            steps {
                cleanWs()
                sh 'rm -rf .git'
            }
        }
        stage('Clone repo'){  // Clones repo into the working directory
            steps{
                sh "git clone ${git_repository} ."
                sh "git checkout ${git_branch}"
            }
        }
        stage('Build image'){  // Builds the image from a Dockerfile
            steps{
                sh "docker image build --tag jenkins-pipeline/${docker_tag}  --label 'org.opencontainers.image.source=https://github.com/dacesmo/santander-training' . # --label 'stage=PROD'"
            }
        }
        stage('Sysdig Vulnerability Scan CLI'){  // Scans the built image using Sysdig inline scanner
            steps{
                if(!env.sysdig_plugin){
                    withCredentials([string(credentialsId: 'sysdig_secure_api_token', variable: 'secure_api_token')]) {
                        sh 'curl -LO "https://download.sysdig.com/scanning/bin/sysdig-cli-scanner/$(curl -L -s https://download.sysdig.com/scanning/sysdig-cli-scanner/latest_version.txt)/linux/amd64/sysdig-cli-scanner"'
                        sh 'chmod +x ./sysdig-cli-scanner'
                        sh "SECURE_API_TOKEN=${secure_api_token} ./sysdig-cli-scanner --apiurl ${sysdig_url} ${sysdig_cli_args} jenkins-pipeline/${docker_tag}"
                    }
                }
            }
        }
        stage('Sysdig Vulnerability Scan Plugin'){
            steps{
                if(env.sysdig_plugin){
                    sysdigImageScan engineCredentialsId: 'sysdig_secure_api_token', imageName: "jenkins-pipeline/${params.docker_tag}", engineURL: "${params.sysdig_url}", policiesToApply: "${params.plugin_policies_to_apply}", bailOnFail: ${params.bail_on_fail}, bailOnPluginFail: ${params.bail_on_plugin_fail}
                }
            }
        }
        stage('Tag Docker Image'){  // Tags the image to be pushed to the Container Registry
            steps{
                sh 'docker tag jenkins-pipeline/${docker_tag} ${registry_url}/${docker_tag}'
            }
        }
        stage('Push Docker Image'){  // Pushes the images to the Container Registry
            steps{
                withCredentials([usernamePassword(credentialsId: 'gh_cr_token', usernameVariable: 'username', passwordVariable: 'password')]) {
                    sh 'echo ${password} | docker login ghcr.io -u ${username} --password-stdin'
                    sh 'docker push ${registry_url}/${docker_tag}'
                }
            }
        }
    }
}
