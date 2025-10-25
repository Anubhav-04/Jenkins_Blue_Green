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
                    nc -vz 127.0.0.1 2251
                '''
            }
            }
        }
    }
}
