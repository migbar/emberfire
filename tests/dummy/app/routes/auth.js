import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel() {
    console.log('beforeModel');
    return this.get('session').fetch().catch(() => undefined);
  },
});
