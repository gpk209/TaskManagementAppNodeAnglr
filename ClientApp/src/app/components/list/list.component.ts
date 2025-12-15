import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { TaskService } from '../../services/taskservice';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/todoitem';
import { AccountService } from '../../services/accountService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
  providers:[TaskService]
})
export class ListComponent implements OnInit, OnDestroy{
  title:string ="";
  description:string ="";
  priority:string = "Medium";
  status:string = "Pending";
  dueDate:string = "";
  private tasks: Task[] = [];
  username:String = ""
  isNewStart:boolean = true;
  
  // Filter properties
  filterStatus: string = 'All';
  filterPriority: string = 'All';
  
  private subscriptions = new Subscription();
  
  priorities = ['Low', 'Medium', 'High'];
  statuses = ['Pending', 'Completed'];
  
  constructor(private taskService: TaskService, private accountService:AccountService){}

  getTasks():Task[]{
    // Apply filters
    let filteredTasks = this.tasks.filter(task => {
      const statusMatch = this.filterStatus === 'All' || task.status === this.filterStatus;
      const priorityMatch = this.filterPriority === 'All' || task.priority === this.filterPriority;
      return statusMatch && priorityMatch;
    });

    // Apply sorting
    if(this.isNewStart){
      return filteredTasks.sort((a,b)=>-this.compareDates(a.dueDate, b.dueDate));
    }
    return filteredTasks.sort((a,b)=>this.compareDates(a.dueDate, b.dueDate));
  }

  private compareDates = (a: Date, b: Date): number => {
    if (a < b) return -1;
    if (a > b) return 1;
  
    return 0;
  };
  
  ngOnInit(): void {
    this.accountService.currentUser$.subscribe({
      next: val => {
        this.username = val?.username ?? "";
        // If user is logged out, stop any further processing
        if (!val) {
          return;
        }
      }
    })

    // Only fetch tasks if user is logged in
    if (this.accountService.currentUser$) {
      this.taskService.GetTasks().subscribe({
        next: response => this.tasks = response,
        error: error => {
          console.log(error);
          // If 401 error, the interceptor will handle logout
        },
        complete: () => console.log('Request {GetTasks} has compleated')
      });
    }
  }

  togglecheck(task:Task){
    task.status = task.status === 'Completed' ? 'Pending' : 'Completed';
    this.editTask(task);
  }
  toggleSortCheck(){
    this.isNewStart = !this.isNewStart;
  }
  addTask(){
    if(!this.isFormValid()){
      return;
    }
    const dueDateValue = this.dueDate ? new Date(this.dueDate) : new Date();
    this.taskService.CreateNew(
      new Task("", this.title, this.description, this.status, dueDateValue, this.priority)
    ).subscribe({
      next: response => this.tasks.push(response),
      error: error => console.log(error),
      complete: ()=> console.log('Request {CreateNew} has compleated!')
    });
    
    // Reset form
    this.title ='';
    this.description = '';
    this.priority = 'Medium';
    this.status = 'Pending';
    this.dueDate = '';
  }

  isFormValid(): boolean {
    return this.title.trim() !== '' && 
           this.description.trim() !== '' && 
           this.status !== '' && 
           this.priority !== '' && 
           this.dueDate !== '';
  }

  isTaskValid(task: Task): boolean {
    return task.title.trim() !== '' && 
           task.description.trim() !== '' && 
           task.status !== '' && 
           task.priority !== '' && 
           task.dueDate !== null && task.dueDate !== undefined;
  }
  startEdit(task:Task){
    task.isEditMode = true;
  }
  editTask(task:Task){
    this.taskService.Edit(task).subscribe();
    task.isEditMode = false;
  }
  remove(task: Task){
    this.taskService.Remove(task).subscribe();
    const index = this.tasks.indexOf(task);
    this.tasks.splice(index, 1);
  }
  saveEditToggle(task:Task){
    if(task.isEditMode){
      if(!this.isTaskValid(task)){
        return;
      }
      this.editTask(task);
      return;
    }
    this.startEdit(task);
  }

  // Convert Date object to YYYY-MM-DD string for date input
  getDateString(date: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Update task due date from date input string
  updateTaskDueDate(task: Task, dateString: string): void {
    task.dueDate = dateString ? new Date(dateString) : new Date();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
