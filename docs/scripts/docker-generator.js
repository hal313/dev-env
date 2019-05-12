import { ALL_APPS } from './constants.js';

let getContainerName = appDescriptor => {
  // TODO: This is a hack to name the service containers; better off to not worry about the specific names here - just use remote-xxx (requires change to proxy config)
  let services = ['echo', 'reverse', 'uppercase'];
  let appName = appDescriptor.app;
  let prefix = appDescriptor.containerPrefix || '';
  let suffix = appDescriptor.containerSuffix || '';
  return isHTML(appName) ? `${prefix}${appName}${suffix}` : `${prefix}api-${services[getServiceNumber(appName)-1]}-${appName}${suffix}`;
}

let isHTML = app => 'html' === app.split('-')[0];

let getServiceNumber = app => Number.parseInt(app.split('-')[1], 10);

let generateUseOnlyTemplate = appDescriptor => {
    let appId = appDescriptor.app.split('-').join('');
    return `
  ${appId}:
    image: hal313/${appDescriptor.app}:latest
    container_name: ${getContainerName(appDescriptor)}
    networks:
      - ${appDescriptor.networkName}
`;
}

// The reverse proxy is built with all service names and will fail if a service is missing; this serves as a no op
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

let generateIDETemplate = appsDescriptor => {
    let volumes = '';
    if (!!appsDescriptor.apps && !!appsDescriptor.apps.length) {
        volumes += `    volumes:\n`;
        appsDescriptor.apps.forEach(app => {
            volumes += `      - "\${PROJECT_ROOT}/${app}/app:/home/coder/project/${app}"\n`;
        });
    }
    return `
  ide:
    image: codercom/code-server:1.621
    container_name: ${appsDescriptor.containerPrefix}ide${appsDescriptor.containerSuffix}
    command: --allow-http --no-auth
    networks:
      - ${appsDescriptor.networkName}
${volumes}
`;
    }

export function generateDockerComposeFile(definition) {
  let selectedUseApps = definition.apps.use;
  let selectedDevApps = definition.apps.dev;

  let composeFile = `
version: '3.5'

networks:
  ${definition.networkName}:
    name: ${definition.networkName}

services:

  proxy:
    image: hal313/reverse-proxy:latest
    container_name: ${definition.containerPrefix || ''}reverse-proxy${definition.containerSuffix || ''}
    networks:
      - ${definition.networkName}
    ports:
      - ${definition.port}:80
`;


  // HTML and REMOTE
  let appDescriptor = {
    networkName: definition.networkName,
    containerPrefix: definition.containerPrefix,
    containerSuffix: definition.containerSuffix
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
    networkName: definition.networkName,
    containerPrefix: definition.containerPrefix,
    containerSuffix: definition.containerSuffix
  };

  composeFile += generateIDETemplate(appsDescriptor);

  return composeFile;
}
