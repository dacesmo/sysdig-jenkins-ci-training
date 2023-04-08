pipeline {
    agent any
    parameters {  // Defines Parameters as Code
        string(name: "git_repository", defaultValue: "https://github.com/dacesmo/sysdig-jenkins-ci-training.git", trim: true, description: "Git Repo to build Dockerfile from")
        string(name: "git_branch", defaultValue: "main", trim: true, description: "Git branch to build Dockerfile from")
        string(name: "docker_tag", defaultValue: "myapp:v1.0.1", trim: true, description: "Docker Image Tag")
        string(name: "registry_url", defaultValue: "ssworkshop.jfrog.io", trim: true, description: "Container Registry URL")
        string(name: "registry_repo", defaultValue: "santander", trim: true, description: "Container Registry URL")
        string(name: "sysdig_url", defaultValue: "https://us2.app.sysdig.com", trim: true, description: "Sysdig URL based on Sysdig SaaS region")
        booleanParam(name: 'sysdig_plugin', defaultValue: true, description: 'Want to use Sysdig Jenkins Plugin? (Else, cli scanned will be performed)')
        string(name: "plugin_policies_to_apply", defaultValue: "", description: "Space separated list of policies to apply (Plugin execution only)")
        booleanParam(name: 'bail_on_fail', defaultValue: true, description: 'Want to stop the Pipeline execution if the Scan returns a failed policy evaluation? (Plugin execution only)')
        booleanParam(name: 'bail_on_plugin_fail', defaultValue: true, description: 'Want to stop the pipeline if the Jenkins Plugin Fails? (Plugin execution only)')
        string(name: "sysdig_cli_args", defaultValue: "", trim: true, description: "Optional inline arguments (Sysdig CLI Scanner Execution only)")
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
                sh "docker image build --tag ${registry_url}/${registry_repo}/${docker_tag}  --label 'stage=TRAINING' ."
            }
        }
        stage('Sysdig Vulnerability Scan'){
            parallel{
                stage('CLI Scan'){  // Scans the built image using Sysdig inline scanner
                     steps{
                         script {
                             if(!env.sysdig_plugin){    
                                 withCredentials([string(credentialsId: 'sysdig_secure_api_token', variable: 'secure_api_token')]) {
                                    sh 'curl -LO "https://download.sysdig.com/scanning/bin/sysdig-cli-scanner/$(curl -L -s https://download.sysdig.com/scanning/sysdig-cli-scanner/latest_version.txt)/linux/amd64/sysdig-cli-scanner"'
                                    sh 'chmod +x ./sysdig-cli-scanner'
                                    sh "SECURE_API_TOKEN=${secure_api_token} ./sysdig-cli-scanner --apiurl ${sysdig_url} ${sysdig_cli_args} ${registry_url}/${registry_repo}/${docker_tag}"
                                 }
                             }
                             else{
                                echo 'Using Plugin Scan'
                             }
                         }
                     }
                }
                stage('Plugin Scan'){  // Scans the built image using the Sysdig Jenkins Plugin
                    steps{
                        script{
                            if(env.sysdig_plugin){
                                sysdigImageScan engineCredentialsId: 'sysdig-sa-credentials', imageName: "${registry_url}/${registry_repo}/${docker_tag}", engineURL: "${params.sysdig_url}", policiesToApply: "${params.plugin_policies_to_apply}", bailOnFail: "${params.bail_on_fail}", bailOnPluginFail: "${params.bail_on_plugin_fail}"
                            }
                            else{
                                echo 'Using CLI Scan'
                            }
                        }
                    }
                }
            }
        }
        stage('Push Docker Image'){  // Pushes the images to the Container Registry
            steps{
                withCredentials([usernamePassword(credentialsId: 'jfrog-registry-credentials', usernameVariable: 'username', passwordVariable: 'password')]) {
                    sh 'echo ${password} | docker login ${registry_url} -u ${username} --password-stdin'
                    sh 'docker push ${registry_url}/${registry_repo}/${docker_tag}'
                }
            }
        }
    }
}
