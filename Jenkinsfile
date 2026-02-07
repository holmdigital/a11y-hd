pipeline {
    // NOTE: Requires 'Docker Pipeline' plugin to be installed in Jenkins
    agent {
        docker {
            image 'node:20-slim'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    environment {
        PNPM_HOME = "/var/jenkins_home/.pnpm-store"
        PATH = "${env.PNPM_HOME}:$PATH"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'corepack enable'
                sh 'pnpm install'
            }
        }

        stage('Run Tests') {
            steps {
                // Focus on engine where JUnit is already configured
                sh 'pnpm --filter @holmdigital/engine test -- --reporter=default --reporter=junit --outputFile=junit.xml'
            }
        }
    }

    post {
        always {
            // Jenkins will look for XML files in the workspace
            // Adjust the pattern if your reports are in a specific subfolder like 'reports/*.xml'
            junit '**/junit.xml'
        }
    }
}
