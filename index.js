$(() => {

    $('#js-generate').click(event => {
        event.preventDefault();

        let apps = ['html-01', 'html-02', 'html-03', 'remote-01', 'remote-02', 'remote-03'];

        let selectedUseApps = [];
        let selectedDevApps = [];

        // Find the selected apps to use and develop
        apps.forEach(app => {
            if (!!$(`#${app}-use`).prop('checked')) {
                selectedUseApps.push(app);
            }
            if (!!$(`#${app}-dev`).prop('checked')) {
                selectedDevApps.push(app);
            }
        });

        let composeFile = `
version: '3.5'

networks:
  full_stack:
    name: full_stack

services:

  proxy:
    image: hal313/reverse-proxy:latest
    container_name: reverse-proxy
    networks:
      - full_stack
    ports:
      - ${$('#port').val()}:80
`;

        // HTML and REMOTE
        selectedUseApps.forEach(app => {
            if (selectedDevApps.includes(app)) {
                composeFile += generateUseAndDevTemplate(app);
            } else {
                composeFile += generateUseOnlyTemplate(app);
            }
        });

        // IDE
        composeFile += generateIDETemplate(selectedDevApps);

        let downloadElement = document.createElement('a');
        downloadElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(composeFile));
        downloadElement.setAttribute('download', 'docker-compose.yml');

        downloadElement.style.display = 'none';
        document.body.appendChild(downloadElement);

        downloadElement.click();

        document.body.removeChild(downloadElement);
    });

    let getContainerName = app => {
        let services = ['echo', 'reverse', 'uppercase'];
        console.log('service number', getServiceNumber(app));
        return isHTML(app) ? app : `api-${services[getServiceNumber(app)-1]}-${app}`;
    }

    let generateUseOnlyTemplate = app => {
        let appId = app.split('-').join('');
        return `
  ${appId}:
    image: hal313/${app}:latest
    container_name: ${getContainerName(app)}
    networks:
      - full_stack
`;
    }

    let isHTML = app => 'html' === app.split('-')[0];
    let getServiceNumber = app => Number.parseInt(app.split('-')[1], 10);

    let generateUseAndDevTemplate = (app) => {
        let appId = app.split('-').join('');
        // Set the path based on the type (html or remote)
        let path = isHTML(app) ? '/usr/local/apache2/htdocs' : '/var/www/html';
        return `
  ${appId}:
    image: hal313/${app}:latest
    container_name: ${getContainerName(app)}
    networks:
      - full_stack
    volumes:
      - "\${PROJECT_ROOT}/${app}/app:${path}"
`;
    }

    let generateIDETemplate = (appsToMap) => {
        let volumes = '';
        if (!!appsToMap && !!appsToMap.length) {
            volumes += `    volumes:\n`;
            appsToMap.forEach(app => {
                volumes += `      - "\${PROJECT_ROOT}/${app}/app:/home/coder/project/${app}"\n`;
            });
        }
        return `
  ide:
    image: codercom/code-server:1.621
    container_name: ide
    command: --allow-http --no-auth
    networks:
      - full_stack
${volumes}
`;
    }


});
