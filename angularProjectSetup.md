# Angular Project Setup

## Preliminaries for this Project

- Node.js
- npm
- VS Code
- Git
- Browser

In addition to that, for this project, I will assume that the Angular CLI is installed globally for development:

```powershell
npm install -g @angular/cli
```

- Angular CLI

## Angular CLI

The Angular CLI is not an Angular project / app, it is the toolkit, that will help us to initiate and edit/develop the Angular project.

### Create a new Project

```powershell
ng new angular-app --directory .
```

This will create a new Angular project within a project folder. The project base structure will be created, including some configuration files and needed packages. Also the required packages will be installed.

## Project Base Structure

```
angular-app/
│
├── src/                   (atual application code)
│   ├── app/
│   ├── index.html         Browser entry point
│   ├── main.ts            Angular build entry point
|   ├── app.ts             Root component
|   ├── app.html           Root component html template
│   └── styles.css         Root component styles
│
├── package.json           (package management)
├── package-lock.json      (package management)
├── angular.json           (Angular Configuration)

```

## Add a Component

```powershell
ng generate component compname
```

This will generate a new ```compname``` folder within ``src/app`` and add the following files:

- compname.ts              Component definition
- compname.html            Component html template
- compname.css             Style
- compname.spec.ts         Tests


## Run the Angular Application locally

```
ng serve
   ↓
Angular CLI
   ↓
Development build + development server
   ↓
Browser
```

## Deployment