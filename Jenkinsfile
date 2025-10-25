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
          scp build/artifact.tar.gz dev@${DEPLOY_HOST}:/dev/${GREEN_ENV}/artifact.tar.gz
          ssh dev@${DEPLOY_HOST} '
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

    stage('Smoke Test GREEN') {
      steps {
        // Hit the GREEN endpoint directly or via a green-specific path
        // If NGINX maps /green to /opt/green/current, keep this as is.
        sh 'curl -fsS http://${DEPLOY_HOST}/${GREEN_ENV}/health'
      }
    }

    stage('Switch Traffic to GREEN') {
      steps {
        sshagent(credentials: ['dev-ssh-key-id']) {
        // NGINX upstream flip via symlink then reload
        sh """
          ssh -o StrictHostKeyChecking=no -p 2251 dev@${DEPLOY_HOST} 'set -e
            sudo ln -sfn /etc/nginx/upstreams.${GREEN_ENV}.conf /etc/nginx/conf.d/upstreams.active.conf
            sudo nginx -t
            sudo nginx -s reload
          '
        """
      }
      }
    }

    stage('Post-Switch Validation') {
      steps {
        // Validate the now-live route (root or canonical URL)
        sh 'curl -fsS http://${DEPLOY_HOST}/health'
      }
    }

    stage('Decommission BLUE') {
      steps {
        sshagent(credentials: ['dev-ssh-key-id']) {
        // If you run a blue-serving process, stop it; if purely static behind NGINX, you can skip
        sh """
          ssh -o StrictHostKeyChecking=no -p 2251 dev@${DEPLOY_HOST} 'set -e
            # Optional: stop the blue app service if used
            # sudo systemctl stop app-${BLUE_ENV} || true
          '
        """
      }
      }
    }
  }

  post {
    failure {
      sshagent(credentials: ['dev-ssh-key-id']) {
      echo 'Switch failed — rolling back to BLUE'
      // Point NGINX back to blue and (optionally) restart blue service
      sh """
        ssh -o StrictHostKeyChecking=no -p 2251 dev@${DEPLOY_HOST} 'set -e
          sudo ln -sfn /etc/nginx/upstreams.${BLUE_ENV}.conf /etc/nginx/conf.d/upstreams.active.conf
          sudo nginx -t
          sudo nginx -s reload
          # Optional: ensure blue serving process is up if you use one:
          # sudo systemctl restart app-${BLUE_ENV} || true
        '
      """
    }
    }
    always {
      echo "Build ${env.BUILD_NUMBER} finished with status: ${currentBuild.currentResult}"
    }
  }
}
