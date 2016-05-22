import Ember from 'ember';
import Waitable from '../mixins/waitable';
import firebase from 'firebase';

export default Ember.Object.extend(Waitable, {
  firebase: Ember.inject.service(),

  providers: {
    twitter: firebase.auth.TwitterAuthProvider,
    facebook: firebase.auth.FacebookAuthProvider,
    github: firebase.auth.GithubAuthProvider,
    google: firebase.auth.GoogleAuthProvider,
  },

  open(options) {
    var providerId = options.provider;
    var reject = Ember.RSVP.reject;

    if (!providerId) {
      return reject(new Error('`provider` must be supplied'));
    }

    var auth = this.get('firebase').auth();

    switch (providerId) {
      case 'password':
        if (!options.email && !options.password) {
          return this.waitFor_(reject(new Error('`email` and `password` must be supplied')));
        }

        return this.waitFor_(auth.signInWithEmailAndPassword(options.email, options.password));

      case 'custom':
        if (!options.token) {
          return this.waitFor_(reject(new Error('A token must be supplied')));
        }

        return this.waitFor_(auth.signInWithCustomToken(options.token));

      case 'anonymous':
        return this.waitFor_(auth.signInAnonymously());

      // oauth providers e.g. 'twitter'
      default:
        const provider = new this.providers[providerId]();

        if (options.options && options.options.scopes) {
          options.options.scopes.forEach((s) => provider.addScope(s));
        }

        console.log('auth with popup', providerId);
        if (options.redirect === true) {
          // promise will never resolve unless there is an error (due to redirect)
          return this.waitFor_(auth.signInWithRedirect(provider));
        }
        return this.waitFor_(auth.signInWithPopup(provider));
    }
  },


  /**
   * Wraps a promise in test waiters.
   *
   * @param {!Promise} promise
   * @return {!Promise}
   */
  waitFor_(promise) {
    this._incrementWaiters();
    return promise.then((result) => {
      console.log('auth result', result);
      this._decrementWaiters();
      return result;
    }).catch((err) => {
      this._decrementWaiters();
      return Ember.RSVP.reject(err);
    });
  }
});
