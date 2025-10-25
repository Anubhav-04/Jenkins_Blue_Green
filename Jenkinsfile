pipeline {
    agent any

    stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    }
    stages {
        stage('Hello') {
            steps {
                sh '''
                    ssh -p 2251 dev@localhost 'cd /dev && echo "Hello from jenkins" > hello.txt'
                '''
            }
        }
    }
}
