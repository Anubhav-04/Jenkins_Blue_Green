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
                sh '''
                    ssh -p 2251 dev@127.0.0.1 'cd /dev && echo "Hello from jenkins" > hello.txt'
                '''
            }
        }
    }
}
