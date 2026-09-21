import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Project } from './project-list/interfaces'
import { Observable } from 'rxjs';


@Service()
export class ProjectService {
  private http = inject(HttpClient);

  getProjects(): Observable<Project[]>  {
    return this.http.get<Project[]>('/projects.json');
  }
}