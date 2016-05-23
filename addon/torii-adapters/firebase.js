import Ember from 'ember';

export default Ember.Object.extend({
  firebase: Ember.inject.service(),

  /**
   * Extacts session information from authentication response
   *
   * @param {object} authResult
   * @return {Promise}
   */
  open(authResult) {
    let currentUser = authResult.user;

    return Ember.RSVP.resolve({
      provider: this.extractProviderId_(authResult),
      uid: currentUser.uid,
      currentUser: currentUser
    });
  },


  /**
   * Restore existing authenticated session
   *
   * @return {Promise}
   */
  fetch() {
    let auth = this.get('firebase').auth();
    let currentUser = auth.currentUser;
    if (currentUser) {
      return Ember.RSVP.resolve(this.open({ user: currentUser }));
    } else {
      return Ember.RSVP.reject('No session available');
    }
  },


  /**
   * Close existing authenticated session
   *
   * @return {Promise}
   */
  close() {
    return this.get('firebase').auth().signOut();
  },

  /**
   * Extracts the provider id from the auth payload
   *
   * @param {!Object} authResult
   * @private
   */
  extractProviderId_(authResult) {
    if (authResult.user.isAnonymous) {
      return 'anonymous';
    }

    if (authResult.user.providerData && authResult.user.providerData.length) {
      return authResult.user.providerData[0].providerId;
    }

    return 'unknown';
  }
});
