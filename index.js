import { generateDockerComposeFile } from './scripts/docker-generator.js';
import { configureEnvironment } from './scripts/configurator.js';
import { ALL_APPS } from './scripts/constants.js';

$(() => {

  // Pre-select config
  (($) => {
    let descriptor = {
      apps: {
        use: [],
        dev: []
      },
      port: $('#port').val()
    }

    // Parse the URL query string into an environment descriptor
    let queryString = location.search.substring(1);

    queryString.split('&').forEach(specifier => {
      let [type, value] = specifier.split('=');

      switch (type) {
        case 'port':
          descriptor.port = Number.parseInt(value, 10);
          break;
        case 'use':
        case 'dev':
          if (!descriptor.apps[type].includes(value)) {
            descriptor.apps[type].push(value);
          }
          break;
        default:
          console.log(`Unknown descriptor type "${type}" (value=${value})`);
      }
    });

    configureEnvironment($, descriptor);
  })(jQuery);


  $('#js-generate').click(event => {
    event.preventDefault();

    let selectedUseApps = [];
    let selectedDevApps = [];

    // Find the selected apps to use and develop
    ALL_APPS.forEach(app => {
      if (!!$(`#${app}-use`).prop('checked')) {
        selectedUseApps.push(app);
      }
      if (!!$(`#${app}-dev`).prop('checked')) {
        selectedDevApps.push(app);
      }
    });

    let composeFile = generateDockerComposeFile({
      apps: {
        use: selectedUseApps,
        dev: selectedDevApps
      }
    });

    let downloadElement = document.createElement('a');
    downloadElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(composeFile));
    downloadElement.setAttribute('download', 'docker-compose.yml');

    downloadElement.style.display = 'none';
    document.body.appendChild(downloadElement);

    downloadElement.click();

    document.body.removeChild(downloadElement);
  });

});
