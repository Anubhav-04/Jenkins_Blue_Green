pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                checkout scm
        }
        }
        stage('Hello') {
            steps {
                sshagent(credentials: ['dev-ssh-key-id']) {
                sh '''
                    ssh -o StrictHostKeyChecking=no -p 2251 dev@127.0.0.1 'cd /home/dev && echo "Hello from jenkins" > jenkins.txt'
                '''
            }
            }
        }
    }
}
