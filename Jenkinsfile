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

        stage('Build Project') {
            steps {
                // Building the engine, skipping DTS for CI speed/reliability
                sh 'pnpm --filter @holmdigital/engine build --no-dts'
            }
        }

        stage('Accessibility Scan') {
            steps {
                // node:20-slim is missing libraries needed by Chrome. We install them here.
                sh '''
                    apt-get update && apt-get install -y \
                    libgobject-2.0-0 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
                    libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxext6 \
                    libxfixes3 libxrandr2 libgbm1 libasound2 libpangocairo-1.0-0 libgtk-3-0
                '''
                
                // Install Chrome browser
                sh 'pnpm --filter @holmdigital/engine exec puppeteer browsers install chrome'
                
                // Run the scan
                sh 'node ./packages/engine/dist/cli/index.js https://wiki.holmdigital.se --junit accessibility-report.xml --ci'
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
