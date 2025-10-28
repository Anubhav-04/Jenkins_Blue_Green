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
    id_ed25519 = credentials('id_ed25519')
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
          ssh -o StrictHostKeyChecking=no -P 2251 dev@host.docker.internal 'sudo mkdir -p green && sudo chmod 700 green'
          scp -P 2251 -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i ${id_ed25519} /dist dev@host.docker.internal:/home/dev/green
        '''
        // If serving via a lightweight static server (e.g., nginx or node serve), restart the green service
      }
      }
    }
  }
}
