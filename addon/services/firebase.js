import firebase from 'firebase';

export default {
  create() {
    console.log('init app');
    if (!this.config.firebase || typeof this.config.firebase !== 'object') {
      throw new Error('Please set the `firebase` property in your environment config.');
    }
    firebase.initializeApp(this.config.firebase);
    return firebase;
  },

  config: null,
  isServiceFactory: true
};
