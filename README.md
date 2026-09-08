## Multi-Repo Setup (Shell and Remote MFE)

This document provides instructions for setting up, running, and maintaining the application, which is composed of two separate repositories:

- fe-ucc-shell: The container (host) application.

- fe-ucc-remote: The remote micro frontend (MFE).
  It also covers environment setup, Azure AD configuration, npm access, and runtime requirements.

## Repository Overview

- fe-ucc-shell (Shell app/host): https://github.com/Teladoc/fe-ucc-shell.git
- fe-ucc-remote (Remote Org Config MFE): https://github.com/Teladoc/fe-ucc-remote.git

**Note:** Both repositories must be cloned and run independently, but together.

## Prerequisites

- Node.js (version 18.x or higher recommended)
- Access to JFROG Artifactory for npm packages

.npmrc Configuration

In the root directory of both repositories, create a .npmrc file with the following content (replace placeholders with your actual email and JFROG token):

```js
registry=https://artifactory.intouchhealth.io/artifactory/api/npm/npm/
@teladoc:registry=https://artifactory.intouchhealth.io/artifactory/api/npm/npm/
//artifactory.intouchhealth.io/artifactory/api/npm/npm/:_authToken={AUTH_TOKEN}
```

## Getting started

Clone both repositories and install dependencies:

```js
git clone https://github.com/Teladoc/fe-ucc-shell.git
cd fe-ucc-shell
npm install

git clone https://github.com/Teladoc/fe-ucc-remote.git
cd fe-ucc-remote
npm install
```

## Running the application

**Important:** Ensure no other application is running on localhost:4101. The shell application dynamically loads the remote application from this URL.

Run both repositories in separate terminal windows:

```js
# In one terminal
cd fe-ucc-remote
npm run dev

# In another terminal
cd fe-ucc-shell
npm run dev
```

### Test Coverage

To run and see the coverage

```bash
npm run coverage
```

This generates a coverage folder at the root, click index.html to see the coverage in the browser. Also you can see it in the terminal as well.

## Azure AD SSO

- Request access via a service ticket, referencing the Azure AD group for this app:
  https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Authentication/appId/9317b8f0-75be-472b-b251-46c679096c57
- Any Assistance on SSO login Issue contact: ashish.tiwari@teladochealth.com
