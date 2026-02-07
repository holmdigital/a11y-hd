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
                // We add --no-frozen-lockfile to allow Jenkins to update the lockfile
                // if it's out of sync with package.json
                sh 'pnpm install --no-frozen-lockfile'
            }
        }

        stage('Run Tests') {
            steps {
                // Using the absolute path to the binary in the root node_modules
                // to avoid issues with pnpm linking in mid-migration monorepos
                sh './node_modules/.bin/vitest run packages/engine --reporter=default --reporter=junit --outputFile=junit.xml'
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
