import { generateDockerComposeFile } from './docker-generator.js';
import { configureEnvironment, parseEnvironmentFromQueryString } from './configurator.js';
import { ALL_APPS } from './constants.js';
import { generateBashScript } from './bash-generator.js';

$(() => {

  // Pre-select config
  (($) => {

    // Parse the URL query string into an environment descriptor
    let defaults = {
      port: $('#port').val(),
      networkName: $('#network-name').val(),
      containerPrefix: $('#container-prefix').val(),
      containerSuffix: $('#container-suffix').val()
    };
    let descriptor = parseEnvironmentFromQueryString(location.search.substring(1), defaults);

    // Populate the settings
    configureEnvironment($, descriptor);
  })(jQuery);

  // Handle downloads
  $('.js-download').click(event => {
    event.preventDefault();

    let definition = generateDefinition();
    let dockerComposeFileContent = generateDockerComposeFile(definition);
    let bashFileContent = generateBashScript(definition);
    let downloadTarget = $(event.target).data('download-target');
    let tabTarget = $(event.target).data('tab-target');

    // Populate the script contents
    $('#docker-compose-yml').html(dockerComposeFileContent);
    $('#bash-script').html(bashFileContent);
    $('#macos-script').html(bashFileContent);

    // Show the generated code container
    $('#js-generated-content-container').show();

    // Select the correct tab
    $(`#${tabTarget}`).tab('show');

    // Send the content
    switch (downloadTarget) {
      case 'docker':
        download(dockerComposeFileContent, 'docker-compose.yml');
        break;
      case 'bash':
        download(bashFileContent, 'linux-start-sde.sh');
        break;
      case 'macos':
        download(bashFileContent, 'macos-start-sde.sh');
        break;
    }
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
      port: $('#port').val(),
      networkName: $('#network-name').val(),
      containerPrefix: $('#container-prefix').val(),
      containerSuffix: $('#container-suffix').val()
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
