import QualityPlugin from './plugin';
import QualityActions from 'actions';
import QualityStore from 'stores';

/**
 * A sample role for the component.
 */
const ROLE = {
  name: 'Quality',
  component: QualityPlugin
};

/**
 * Activate all the components in the Performance Plugin package.
 * @param {Object} appRegistry - The Hadron appRegisrty to activate this plugin with.
 **/
function activate(appRegistry) {
  // Register the QualityPlugin as a role in Compass
  //
  // Available roles are:
  //   - Instance.Tab: { name: <String>, component: <React.Component>, order: <Number> }
  //   - Database.Tab: { name: <String>, component: <React.Component>, order: <Number> }
  //   - Collection.Tab: { name: <String>, component: <React.Component>, order: <Number> }
  //   - CollectionHUD.Item: { name <String>, component: <React.Component> }
  //   - Header.Item: { name: <String>, component: <React.Component>, alignment: <String> }

  appRegistry.registerRole('Collection.Tab', ROLE);
  appRegistry.registerAction('Quality.Actions', QualityActions);
  appRegistry.registerStore('Quality.Store', QualityStore);
}

/**
 * Deactivate all the components in the Performance Plugin package.
 * @param {Object} appRegistry - The Hadron appRegisrty to deactivate this plugin with.
 **/
function deactivate(appRegistry) {
  appRegistry.deregisterRole('Database.Tab', ROLE);
  appRegistry.deregisterAction('Quality.Actions');
  appRegistry.deregisterStore('Quality.Store');
}

export default QualityPlugin;
export { activate, deactivate };
