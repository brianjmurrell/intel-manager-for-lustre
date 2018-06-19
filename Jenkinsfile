pipeline {
  agent {
    node {
      label 'master'
    }

  }
  stages {
    stage('Build') {
      agent {
        node {
          label 'el7'
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