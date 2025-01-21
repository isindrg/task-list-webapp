import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../task.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  newTask: Partial<Task> = this.resetTask();
  filter = { contactPerson: '', taskType: '', status: '' };
  sortBy = 'entity_name';
  errorMessage = '';

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  // Load tasks from the backend
  loadTasks(): void {
    this.taskService.getTasks(this.filter, this.sortBy).subscribe(
      tasks => (this.tasks = tasks),
      error => {
        this.errorMessage = 'Error loading tasks. Please try again later.';
        console.error('Error loading tasks:', error);
      }
    );
  }

  // Apply filters
  applyFilters(): void {
    this.loadTasks();
  }

  // Apply sorting
  applySorting(): void {
    this.loadTasks();
  }

  // Add a new task
  addTask(): void {
    if (this.isValidTask(this.newTask)) {
      try {
        if (this.newTask.time_of_task) {
          const date = new Date(this.newTask.time_of_task);
          this.newTask.time_of_task = date.toISOString().slice(0, 19); // Format the date
        }

        this.taskService.createTask(this.newTask).subscribe(
          () => {
            this.loadTasks();
            this.newTask = this.resetTask();
            this.errorMessage = '';
          },
          error => {
            this.errorMessage = error.error?.message || 'Error creating task. Please try again.';
            console.error('Error creating task:', error);
          }
        );
      } catch (e) {
        this.errorMessage = 'Invalid date format. Please provide a valid date.';
      }
    } else {
      this.errorMessage = 'Please fill all required fields!';
    }
  }

  // Reset the task form
  private resetTask(): Partial<Task> {
    return {
      entity_name: '',
      task_type: '',
      time_of_task: '',
      contact_person: '',
      status: 'open',
      note: ''
    };
  }

  // Validation function for required fields
  private isValidTask(task: Partial<Task>): boolean {
    return (
      !!task.entity_name &&
      !!task.task_type &&
      !!task.time_of_task &&
      !!task.contact_person
    );
  }

  // Update an existing task
  updateTask(task: Task): void {
    this.taskService.updateTask(task.id, task).subscribe(
      () => this.loadTasks(),
      error => {
        this.errorMessage = 'Error updating task. Please try again.';
        console.error('Error updating task:', error);
      }
    );
  }

  // Delete a task
  deleteTask(taskId: number): void {
    this.taskService.deleteTask(taskId).subscribe(
      () => this.loadTasks(),
      error => {
        this.errorMessage = 'Error deleting task. Please try again.';
        console.error('Error deleting task:', error);
      }
    );
  }

  // Filter tasks based on criteria
  filteredTasks(): Task[] {
    return this.tasks.filter(task => {
      return (
        (this.filter.contactPerson ? task.contact_person === this.filter.contactPerson : true) &&
        (this.filter.taskType ? task.task_type === this.filter.taskType : true) &&
        (this.filter.status ? task.status === this.filter.status : true)
      );
    });
  }

  // Get unique contact persons for filtering
  getUniqueContactPersons(): string[] {
    return [...new Set(this.tasks.map(task => task.contact_person))];
  }

  // Get unique task types for filtering
  getUniqueTaskTypes(): string[] {
    return [...new Set(this.tasks.map(task => task.task_type))];
  }
}
