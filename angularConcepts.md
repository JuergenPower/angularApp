##### ANGULAR Overview ######

## Framework

Not only an UI library but a franwork! It contains all you need for:

- Routing
- Enforces project structure
- TypeScript
- Dependency Injection
- HTTP Client
- Testing
- Contains build tools

## Main Concepts

- Components
- HTML Templates
- Services (Logic / Connectors / Repos) @Injectable({ providedIn: 'root' })
- Dependency Injection (usually Services into Component)
- Data Binding
	- Interpolation
	- Property Binding
	- Event Binding
	- Two Way Binding
- Signals (as simple alternative to observable constructs)
- Pipes (transforms data, can be used directly in a template)
- @Input / @Output for component communication
- Interceptors (middleware)
- (Rout) Guards	(Authentication, Authorization)

### What is Angular?

Frontend framework for SPA (single page applications). DI, routing, HTTP, forms, ... are not some external libraries but all a part oft the angular ecosystem. The core of an Angular app is the "component"

### Components

Typical Anglular component:

```
Component
├── TypeScript
├── HTML Template
└── CSS
```

Example component:

```typescript
@Component({
  selector: 'app-flight-list',
  templateUrl: './flight-list.component.html'
})
export class FlightListComponent {

  flights = [
    { id: 'LH123', destination: 'London' },
    { id: 'LH456', destination: 'Paris' }
  ];
}
```

with a HTML template:

```html
<h2>Flights</h2>

<ul>
  <li *ngFor="let flight of flights">
    {{ flight.id }} → {{ flight.destination }}
  </li>
</ul>
```

Component => State and Logic

HTML template => View

### Data Binding

As can be seen in the component example above, the template can access the data / properties / methods of the component class. The template is "bound" to the component class. There are multiple kinds of bindings:

#### Interpolation

Component → Template
```html
<p>{{ name }}</p>
```
Component data is used as a elemnt content.

#### Property Binding
Component → Template
```html
<button [disabled]="isLoading">click here</button>
```
Component data is used as a DOM property.

#### Event Binding
Template → Component
```
<button (click)="loadFlights()">click here</button>`
```
A browser event trigger a component method.

#### Two Way Binding
```
<input [(ngModel)]="name">
```
Component → Template and also Template → Component


### Component communication

Component can have a parent - child relation and in this case they often need to comunicat data or events.

#### Inputs

parent → child

Component data can be annotated as input in the child component:

```typescript
flights = input<Flight[]>;
```

This way, the value can be bound to parent data:

```html
<child-component [flights]="flights"></child-component>
```

#### Outputs

child → parent

An example would be too verbose but in principle, the child component defines an output object and the parent uses event binding to bind a method to the output.

#### Others

For independant component, a common service or a state management approach can be used for communication.

### Services /Dependency Injection

Typically a component will/can handle data from a backend. This data will be provided by a service class:

```typescript
@Injectable()
export class FlightService {

  getFlights() {
    // API call
  }

}
```

The "injectable" class instances are managed by the Angular dependency injection container: 

```
                 Angular DI Container
                         │
                         │ creates/provides
                         ▼
FlightListComponent ──► FlightService
```

This concept has some advantages:

- loose coupling
- better testability
- central dependency and life cycle management

### Routing

A SPA will usually have different views/components with different URLs / URL parameters. The mapping from URL (parameters) to the views / components will be done by the Angular Router:

```
URL
 │
 ▼
Angular Router
 │
 ├── /flights        → FlightListComponent
 │
 ├── /flights/:id    → FlightDetailComponent
 │
 └── /settings       → SettingsComponent
 ```

The basic concept of a SPA is that the different views doesnt have to be loaded every time the user changes the view. This will be done by the local angular app running in the browser.

### HTTP Requests to the Backend

The ANgular framework includes a HttpClient class for HTTP requests. It's typically used by service classes like so:

```
Component
    │
    ▼
FlightService
    │
    ▼
HttpClient
    │
    ▼
REST API
```

### Observables

Usually a service class responsible for fetching a list of data will not just simply return the ready to use list, but a "observable" object:

```typescript
Observable<Flight[]>
```

This object represents an asynchonuos data stream we can subscribe to, providing an observer with methods for `next`, `complete` and `error`. It also provides many more usefull methods that makes handling data streams a lean task.


### Signals

Signals were introduced with Angular 16/17+. Basically they replace normal component properties that are used / boudn in HTML templates. The goal was an optimization of the update time (zoneless Angular). 

=> Best practice: Every state used in HTML should be a signal!

Example: Replace

```typescript
name = 'Max';

changeName() {
  this.name = 'Anna'; 
  // Zone.js searches the whole app for potentil changes...
}
```
and
```html
<p>{{ name }}</p>
<button (click)="changeName()">change name</button>
```

to

```typescript
name = signal('Max'); // 1. make name a signal

changeName() {
  this.name.set('Anna'); // 2. update with .set()
}
```
and
```html
<p>{{ name() }}</p> <!-- 3. name -> name() -->
<button (click)="changeName()">change name</button>
```

### Standalone Components

Because of shortcomings of browsers and build tools imports between component where a pain. An additional layer "NgModules" had to be used to bypass this problems:

```typescript
@NgModule({
  declarations: [FlightListComponent],
  imports: [CommonModule, HttpClientModule] 
})
export class FlightModule { }
```

The new standalone components eliminate this layer and simplifies the syntax. The imports can be defined in the component deffinition directly:

```typescript
@Component({
  selector: 'app-flight-list',
  standalone: true, // Tells Angular: "I manage myself" (usually default already)
  imports: [CommonModule, RouterLink], // Directly import what THIS component needs
  templateUrl: './flight-list.component.html'
})
export class FlightListComponent { }
```

This comes with additional runtime optimizations in the background also.

TODO: Component Lifecycle, Forms, Directives, Pipes, Testing