pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
  }

  environment {
    APP_NAME   = 'my-react-app'
    BLUE_ENV   = 'blue'
    GREEN_ENV  = 'green'
    ACTIVE     = 'blue'
    DEPLOY_HOST = 'host.docker.internal'
  }
  tools {
        nodejs "NodeJS"   // Use the NodeJS version configured in Jenkins
    }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Node Version & Cache') {
      steps {
        sh 'node -v || true'
        sh 'npm -v || true'
      }
    }

    stage('Install') {
      steps {
        // Use npm ci for clean, reproducible installs
        sh 'npm ci'
      }
    }

    stage('Test') {
      steps {
        // Vitest in jsdom environment
        sh 'npm test'
      }
      post {
        always {
          // If you output junit from Vitest, publish here; otherwise keep as-is
          echo 'Tests completed'
        }
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'         // Produces dist/
        sh '''
          mkdir -p build
          tar -C dist -czf build/artifact.tar.gz .
          echo "Created build/artifact.tar.gz"
        '''
        archiveArtifacts artifacts: 'build/artifact.tar.gz', onlyIfSuccessful: true
      }
    }

    stage('Deploy to GREEN') {
      steps {
        // Copy artifact to green slot and stage it under /opt/green
        sshagent(credentials: ['dev-ssh-key-id']) {
        sh '''
          ssh -o StrictHostKeyChecking=no -p 2251 dev@${DEPLOY_HOST} 'sudo mkdir -p /dev/${GREEN_ENV} && sudo chown -R dev:dev /dev/${GREEN_ENV}'
          scp -o StrictHostKeyChecking=no build/artifact.tar.gz -p 2251 dev@${DEPLOY_HOST}:/dev/${GREEN_ENV}/artifact.tar.gz
          ssh -o StrictHostKeyChecking=no -p 2251 dev@${DEPLOY_HOST} '
            set -e
            cd /dev/${GREEN_ENV}
            rm -rf ./current && mkdir -p ./current
            tar -xzf artifact.tar.gz -C ./current
          '
        '''
        // If serving via a lightweight static server (e.g., nginx or node serve), restart the green service
        sh '''
          ssh -o StrictHostKeyChecking=no -p 2251 dev@${DEPLOY_HOST} '
            set -e
            # For static hosting behind NGINX you may not need a service.
            # Uncomment if you run a green-specific service (e.g., app-green) to serve /dev/green/current:
            # sudo systemctl restart app-${GREEN_ENV} || true
          '
        '''
      }
      }
    }
  }
}
