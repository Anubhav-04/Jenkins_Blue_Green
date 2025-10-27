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
      }
    }

    stage('Deploy to GREEN') {
      steps {
        // Copy artifact to green slot and stage it under /opt/green
        sshagent(credentials: ['dev-ssh-key-id']) {
        sh '''
          ssh -o StrictHostKeyChecking=no -p 2251 dev@${DEPLOY_HOST} 'sudo mkdir -p /dev/${GREEN_ENV} && sudo chown -R dev:dev /dev/${GREEN_ENV}'
          sudo cp /dist /dev/${GREEN_ENV}
        '''
      }
      }
    }
  }
}
