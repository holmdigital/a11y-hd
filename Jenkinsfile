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

        stage('Run Unit Tests') {
            steps {
                sh './node_modules/.bin/vitest run packages/engine --reporter=default --reporter=junit --outputFile=junit-unit.xml'
            }
        }

        stage('Accessibility Scan') {
            steps {
                // Testing the engine against a sample URL (or your own dev/staging URL)
                // We use the local engine build to scan
                sh 'pnpm --filter @holmdigital/engine exec engine https://wiki.holmdigital.se --junit accessibility-report.xml --ci'
            }
        }
    }

    post {
        always {
            // Pick up both unit tests and accessibility scan results
            junit '*.xml'
        }
    }
}
