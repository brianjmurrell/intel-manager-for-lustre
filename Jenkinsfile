pipeline {
  agent any
  stages {
    stage('Build') {
      agent {
        docker {
          image 'centos7'
        }

      }
      steps {
        timeout(time: 30, activity: true) {
          sh 'make rpms'
        }

      }
    }
  }
}