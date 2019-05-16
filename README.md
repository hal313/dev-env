# dev-env

> This is part of the ["standard development environment" example ](https://github.com/hal313/standard-development-environment-example). See that page for more information.

## Purpose

This is the generator for the Docker environments and startup scripts.

## Usage

Either running locally or against the GitHub Pages site (located at https://hal313.github.io/dev-env/), each environment component may be selected for use and/or development. Once selected, a raw `docker-compose.yml` can be downloaded, as well as startup scripts for various operating systems.

> IMPORTANT: If the `docker-compose.yml` file is being used manually AND any components are being "developed", the `PROJECT_ROOT` environment variable MUST be set to the root of the GIT repositories for the required development components. The downloadable scripts will automatically clone the required git repositories and set the variable. It is HIGHLY recommended that the scripts are used.

## "Bookmarks"

The [generator](https://hal313.github.io/dev-env/) can parse query strings to pre-define an environment.

Using the `dev` or `use` parameter any number of times, with the components as values. For example, to specify that the `html-01` and `remote-01` components are to be available for development, this URL will select the correct settings:

https://hal313.github.io/dev-env/?dev=html-01&dev=remote-01

Note that if `use` is specified at least once, all components *except* for the specified component(s) will be deselected.

### Docker Compose Notes

The Docker command `docker-compose` will build an environment based on a `docker-compose.yml` file. The command:

```bash
docker-compose up
```

Will build and start an environment. Note that this command will stop AND remove the enviroment:

```bash
docker-compose down
```

However, stopping an environment without removing it can be accomplished using:

```bash
docker-compose stop
```

A subsequent command will restart the environment:

```bash
docker-compose start
```

### Example Manual Usage

Consider a case where HTML-01 and REMOTE-01 are under development. Download a suitable environment definition which selects those two components to be developed ([this link](https://hal313.github.io/dev-env/?dev=html-01&dev=remote-01) pre-selects the appropriate components).

Now, the require repositiories need to be cloned:

```bash
git clone git@github.com:hal313/html-01.git
git clone git@github.com:hal313/remote-01.git
```

Set the environment variable (based on the current directory)

```bash
export PROJECT_ROOT=$(pwd)
```

Start the environment:

```bash
docker-compose up
```

## Development Tips

Using tools such [browser-sync](https://www.browsersync.io/) or [ngrok](https://ngrok.com/) can greately reduce the development cycle. A tool such as "browser-sync" allows multiple browsers to react to one set of inputs; this is ideal for testing across multiple browsers.

```bash
## Install:
npm install -g browser-sync

## Run against the local dev-env instance:
browser-sync start --proxy localhost:10080 --files html-01/app/*
```

Tools similar to "ngrok" can be used to test mobile or remote devices against the local machines by tunneling traffic. Once downloaded, run the binary file:

```bash
## Run against the local dev-env instance:
ngrok http 10080
```

## TODO
Muliple instances of generated environments cannot exist at the same time on any system because the container names will collide between environments.

While this generator supports prefix and suffix additions to the container names, the [proxy](https://github.com/hal313/reverse-proxy) does not.

Two solutions would be sufficient:
1. Configure the proxy to dynamically forward based on the URL
2. Generate the proxy configuration file for each download

Solution (1) would be great for dynamic addition of hosts, though the sub-apps will need to modify their AJAX URL's to support this. Instead of `/api/echo`, the AJAX call would be `/api/remote-01` and the proxy would forward the request to `remote-01`.

Solution (2) requires a back-end on the dev-env site in order to generate a config file and build a custom container.
