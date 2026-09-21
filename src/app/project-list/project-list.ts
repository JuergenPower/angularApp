import { Component, inject,  signal } from '@angular/core';
import { Project } from './interfaces';
import { ProjectService } from '../projectService';

@Component({
  imports: [],
  selector: 'app-project-list',
  styleUrl: './project-list.css',
  templateUrl: './project-list.html',
})
export class ProjectList {
  projects = signal<Project[]>([]);

  private projectService = inject(ProjectService);

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(projects => {
      this.projects.set(projects);
    });
  }
}
