# Context of Angular

```
Windows
   │
   ├── VS Code
   │     └── edit the code base
   │
   └── Node.js
         │
         ├── npm
         │     └── manages packages
         │
         └── Angular CLI (ng)
               ├── create new project
               ├── generate code templates
               ├── start a development server, serving the app to a browser
               └── build/test
                        │
                        ↓
                  Angular-project
                        │
                        ↓
                     Browser
```

Of course Angular is independent of the development environment of your choice but it uses Node.js-based tooling during development/build. Angular in this context is a bundle of npm packages that can be installed (for example with npm). The Angular CLI provides us a toolkit for development.

Finally, the Angular application will run in a internet browser.