import { ALL_APPS } from './constants.js';

// TODO: This is mostly duplicate code from index.js:generateDefinition; can these be combined - or at least share some of the same logic to generate the same definition schema?
export function parseEnvironmentFromQueryString(queryString, defaults) {
    let descriptor = {
        apps: {
          use: [],
          dev: []
        },
        port: defaults.port,
        networkName: defaults.networkName,
        containerPrefix: defaults.containerPrefix,
        containerSuffix: defaults.containerSuffix
      }

    queryString.split('&').forEach(specifier => {
        let [type, value] = specifier.split('=');

        switch (type) {
          case 'port':
            descriptor.port = Number.parseInt(value, 10);
            break;
          case 'network-name':
            descriptor.networkName = value;
            break;
          case 'container-prefix':
            descriptor.containerPrefix = value;
            break;
          case 'container-suffix':
            descriptor.containerSuffix = value;
            break;
          case 'use':
          case 'dev':
            if (!descriptor.apps[type].includes(value)) {
              descriptor.apps[type].push(value);
            }
            break;
          default:
            if (!!type) {
              console.log(`Unknown descriptor type "${type}" (value=${value})`);
            }
        }
    });

    return descriptor;
}

export function configureEnvironment($, descriptor) {

    // Set the port
    $('#port').val(descriptor.port);

    // Set the network name
    $('#network-name').val(descriptor.networkName);

    // Set the container prefix
    $('#container-prefix').val(descriptor.containerPrefix);

    // Set the container suffix
    $('#container-suffix').val(descriptor.containerSuffix);

    // Select the apps
    //
    // The development apps
    (descriptor.apps.dev || []).forEach(app => {
        $(`#${app}-dev`).prop('checked', true);
    });
    //
    //
    // Apps to use is slightly different:
    //  if NO APPS are selected
    //    then select ALL apps for use
    //  otherwise
    //    select only specified apps
    if (0 === (descriptor.apps.use || []).length) {
        ALL_APPS.forEach(app => {
            $(`#${app}-use`).prop('checked', true);
        });
    } else {
        ALL_APPS.forEach(app => {
            $(`#${app}-use`).prop('checked', !!descriptor.apps.use.includes(app));
        });
    }

}
