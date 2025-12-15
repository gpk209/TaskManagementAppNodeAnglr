import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/accountService';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  @Output() cancelRegister = new EventEmitter();
  model: any = {};
  errorMessage: string = '';

 constructor(private accountService: AccountService){

 }

  register(){
    this.errorMessage = ''; // Clear previous errors
    
    // Client-side validation
    if (!this.model.username || !this.model.password) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }
    
    if (this.model.username.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters long';
      return;
    }
    
    if (this.model.password.length < 4) {
      this.errorMessage = 'Password must be at least 4 characters long';
      return;
    }
    
    this.accountService.register(this.model).subscribe({
      next: () =>{
        this.cancel();
      },
      error: error => {
        console.log(error);
        // Extract error message from API response
        this.errorMessage = this.extractErrorMessage(error);
      }
    });
  }
  
  /**
   * Extract error message from HTTP error response
   */
  private extractErrorMessage(error: any): string {
    // Check if error has a body
    if (error.error) {
      // Handle express-validator format: { error: '...', details: [...] }
      if (typeof error.error === 'object') {
        // Check for details array (express-validator)
        if (error.error.details && Array.isArray(error.error.details) && error.error.details.length > 0) {
          // Return the first validation error message
          return error.error.details[0].msg || error.error.error || 'Validation failed';
        }
        // Check for message field
        if (error.error.message) {
          return error.error.message;
        }
        // Check for error field
        if (error.error.error) {
          return error.error.error;
        }
      }
      // API returned a string error
      if (typeof error.error === 'string') {
        try {
          const parsed = JSON.parse(error.error);
          if (parsed.details && parsed.details.length > 0) {
            return parsed.details[0].msg;
          }
          if (parsed.message) return parsed.message;
          if (parsed.error) return parsed.error;
        } catch {
          return error.error;
        }
      }
    }

    // Handle specific HTTP status codes with default messages
    switch (error.status) {
      case 0:
        return 'Unable to connect to server. Please check your connection.';
      case 400:
        return 'Invalid request. Please check your input.';
      case 409:
        return 'Username already exists. Please choose a different one.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'Registration failed. Please try again.';
    }
  }
  cancel(){
    this.cancelRegister.emit(false);    
  }
}
