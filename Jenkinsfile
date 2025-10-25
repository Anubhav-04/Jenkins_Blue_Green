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
                sshagent(credentials: ['id_ed25519.pub']) {
                sh '''
                    ssh -o StrictHostKeyChecking=n -p 2251 dev@127.0.0.1 'cd /home/dev && echo "Hello from jenkins" > jenkins.txt'
                '''
            }
            }
        }
    }
}
