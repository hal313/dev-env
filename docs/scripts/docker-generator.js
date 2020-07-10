import { ALL_APPS } from './constants.js';

/**
 * Gets a container name, based on the app descriptor.
 *
 * @param {*} appDescriptor the application descriptor
 * @returns {String} the container name
 */
let getContainerName = appDescriptor => {
  let services = ['echo', 'reverse', 'uppercase'];
  let appName = appDescriptor.app;
  let prefix = appDescriptor.containerPrefix || '';
  let suffix = appDescriptor.containerSuffix || '';

  // Generate the container name (based on HTML/service and index)
  return isHTML(appName) ? `${prefix}${appName}${suffix}` : `${prefix}api-${services[getServiceNumber(appName)-1]}-${appName}${suffix}`;
}

/**
 * Determines if an application name represents an HTML application.
 *
 * @param {String} applicationName the application name
 * @returns {Boolean} true, if the application is an HTML application
 */
let isHTML = applicationName => 'html' === applicationName.split('-')[0];

/**
 * Gets the service number from the application name.
 *
 * @param {String} applicationName the application name
 * @returns {Number} the service number of the application
 */
let getServiceNumber = applicationName => Number.parseInt(applicationName.split('-')[1], 10);

/**
 * Generates a stanza for use-only (not developing) an application.
 *
 * @param {*} appDescriptor the application descriptor
 * @returns {String} the stanza for using (not developing) an application
 */
let generateUseOnlyTemplate = appDescriptor => {
  // The application ID
  let appId = appDescriptor.app.split('-').join('');

  return `
  ${appId}:
    image: hal313/${appDescriptor.app}:latest
    container_name: ${getContainerName(appDescriptor)}
    networks:
      - ${appDescriptor.networkName}
`;
}

/**
 *
 * The reverse proxy is built with all service names and will fail if a service is missing; this serves as a no-op container.
 *
 * @param {*} appDescriptor the application descriptor
 * @returns {String} a stanza for a no-op container
 */
let generateNoopTemplate = appDescriptor => {
  let appId = appDescriptor.app.split('-').join('');
  return `
  ${appId}:
    image: httpd:2.4.39
    container_name: ${getContainerName(appDescriptor)}
    networks:
      - ${appDescriptor.networkName}
`;
}

/**
 * Generates a stanza for using and developing an application.
 *
 * @param {*} appDescriptor the application descriptor
 * @returns {String} a stanza for using and developing an application
 */
let generateUseAndDevTemplate = (appDescriptor) => {
  let appId = appDescriptor.app.split('-').join('');
  // Set the path based on the type (html or remote)
  let path = isHTML(appDescriptor.app) ? '/usr/local/apache2/htdocs' : '/var/www/html';

  return `
  ${appId}:
    image: hal313/${appDescriptor.app}:latest
    container_name: ${getContainerName(appDescriptor)}
    networks:
      - ${appDescriptor.networkName}
    volumes:
      - "\${PROJECT_ROOT}/${appDescriptor.app}/app:${path}"
`;
}

/**
 * Generates the stanza for the IDE container.
 *
 * @param {*} appsDescriptor the application descriptor
 * @returns {String} the stanza for an IDE container
 */
let generateIDETemplate = appsDescriptor => {
  // The volumes collection
  let volumes = '';

  if (!!appsDescriptor.apps && !!appsDescriptor.apps.length) {
      volumes += `    volumes:\n`;
      appsDescriptor.apps.forEach(app => {
          volumes += `      - "\${PROJECT_ROOT}/${app}/app:/home/coder/project/${app}"\n`;
      });
  }
  return `
  ide:
    image: codercom/code-server:latest
    container_name: ${appsDescriptor.containerPrefix}ide${appsDescriptor.containerSuffix}
    command: --auth none --bind-addr 0.0.0.0:8443 project
    networks:
      - ${appsDescriptor.networkName}
${volumes}
`;
}

/**
 * Generates the Docker compose file contents for an environment definition
 *
 * @param {*} environmentDefinition the definition of the environment
 * @returns {String} the docker compose file
 */
export function generateDockerComposeFile(environmentDefinition) {
  let selectedUseApps = environmentDefinition.apps.use;
  let selectedDevApps = environmentDefinition.apps.dev;

  let composeFile = `
version: '3.5'

## BUILD DATE ${new Date()}

networks:
  ${environmentDefinition.networkName}:
    name: ${environmentDefinition.networkName}

services:

  proxy:
    image: hal313/reverse-proxy:latest
    container_name: ${environmentDefinition.containerPrefix || ''}reverse-proxy${environmentDefinition.containerSuffix || ''}
    depends_on:
      - html01
      - html02
      - html03
      - remote01
      - remote02
      - remote03
      - ide
    networks:
      - ${environmentDefinition.networkName}
    ports:
      - ${environmentDefinition.port}:80
`;


  // HTML and REMOTE
  let appDescriptor = {
    networkName: environmentDefinition.networkName,
    containerPrefix: environmentDefinition.containerPrefix,
    containerSuffix: environmentDefinition.containerSuffix
  };
  selectedUseApps.forEach(app => {
    appDescriptor.app = app;
    if (selectedDevApps.includes(app)) {
        composeFile += generateUseAndDevTemplate(appDescriptor);
    } else {
        composeFile += generateUseOnlyTemplate(appDescriptor);
    }
  });

  // Add no-op servies
  ALL_APPS.forEach(app => {
    appDescriptor.app = app;
    if (!selectedUseApps.includes(app)) {
      composeFile += generateNoopTemplate(appDescriptor);
    }
  });

  // IDE
  let appsDescriptor = {
    apps: selectedDevApps,
    networkName: environmentDefinition.networkName,
    containerPrefix: environmentDefinition.containerPrefix,
    containerSuffix: environmentDefinition.containerSuffix
  };
  composeFile += generateIDETemplate(appsDescriptor);

  return composeFile;
}
