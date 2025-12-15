import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/accountService';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDropdownModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit {
  model: any = {}
  errorMessage: string = '';

  ngOnInit(): void { }

  constructor(
    public accoutnService: AccountService,
    private router: Router
  ) { }

  login() {
    this.errorMessage = ''; // Clear previous errors
    
    // Client-side validation
    if (!this.model.username || !this.model.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }
    
    this.accoutnService.login(this.model).subscribe({
      next: response => {
        console.log(response);
        // Clear form on successful login
        this.model = {};
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
      case 401:
        return 'Invalid username or password.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'Login failed. Please try again.';
    }
  }

  logout() {
    this.accoutnService.logout().subscribe({
      next: () => {
        console.log('Logged out successfully');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if server call fails, user is logged out locally
        this.router.navigate(['/']);
      }
    });
  }
}
