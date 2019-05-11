import { ALL_APPS } from './constants.js';

export function configureEnvironment($, descriptor) {

    // Set the port
    $('#port').val(descriptor.port);

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
