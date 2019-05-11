import { generateDockerComposeFile } from './docker-generator.js';

export function generateBashScript(definition) {
  console.log(definition)
  let bashFile = `#!/bin/sh

## Stop on error
set -e

`;

  definition.apps.dev.forEach(app => {
    bashFile += `
if [ ! -d "${app}" ]; then
  git clone https://github.com/hal313/${app}.git
fi
`;
  });

  // generateDockerComposeFile does not escape the resolvers, so we add this hack in the bash script to do so
  bashFile += `
## Set PROJECT_ROOT so that when the file is written, the resolvers remain
export PROJECT_ROOT=\\$\\{PROJECT_ROOT\\}
`;
  bashFile += `
## Write the docker-compose file
cat << EOF > docker-compose.yml
${generateDockerComposeFile(definition)}
EOF
`;

  bashFile += `
export PROJECT_ROOT=$(pwd)
docker-compose up
`;

  return bashFile;
}
