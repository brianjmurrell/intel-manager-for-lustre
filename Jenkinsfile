pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        timeout(time: 30, activity: true) {
          sh 'make rpms'
        }

      }
    }
  }
}