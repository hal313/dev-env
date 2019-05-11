import { generateDockerComposeFile } from './scripts/docker-generator.js';
import { configureEnvironment, parseEnvironmentFromQueryString } from './scripts/configurator.js';
import { ALL_APPS } from './scripts/constants.js';
import { generateBashScript } from './scripts/bash-generator.js';

$(() => {

  // Pre-select config
  (($) => {

    // Parse the URL query string into an environment descriptor
    let descriptor = parseEnvironmentFromQueryString(location.search.substring(1), $('#port').val());

    // Populate the settings
    configureEnvironment($, descriptor);
  })(jQuery);


  $('#js-generate-docker').click(event => {
    event.preventDefault();

    let definition = generateDefinition();
    let composeFile = generateDockerComposeFile(definition);

    download(composeFile, 'docker-compose.yml');
  });

  $('#js-generate-bash').click(event => {
    event.preventDefault();

    let definition = generateDefinition();
    let bashFile = generateBashScript(definition);

    download(bashFile, 'start-env.sh');
  });

  let generateDefinition = () => {
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

    return {
      apps: {
        use: selectedUseApps,
        dev: selectedDevApps
      },
      port: $('#port').val()
    };
  };

  let download = (content, filename) => {
    let downloadElement = document.createElement('a');
    downloadElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    downloadElement.setAttribute('download', filename);

    downloadElement.style.display = 'none';
    document.body.appendChild(downloadElement);

    downloadElement.click();

    document.body.removeChild(downloadElement);
  };

});
