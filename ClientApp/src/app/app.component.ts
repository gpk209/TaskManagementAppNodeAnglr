import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from "./components/nav/nav.component";
import { HomeComponent } from "./components/home/home.component";
import { AccountService } from './services/accountService';
import { User } from './models/user';
import { ListComponent } from "./components/list/list.component";
import { NgParticlesModule } from "ng-particles";
import { loadSlim } from "tsparticles-slim"; // if you are going to use `loadSlim`, install the "tsparticles-slim" package too.
import { MoveDirection, ClickMode, HoverMode, OutMode, Container, Engine } from "tsparticles-engine";
import { SessionExpiredModalComponent } from './components/session-expired-modal/session-expired-modal.component';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [CommonModule, NavComponent, HomeComponent, ListComponent, NgParticlesModule, SessionExpiredModalComponent]
})
export class AppComponent implements OnInit {
  title = 'Task Management App';
  isSignIn = false;
  isLoading = true;  // Show loading spinner while checking auth
  id = "tsparticles";
  particlesOptions = {
    fullScreen: {
      enable: true,
      zIndex: -1 
    },
    background: {
        color: {
            value: "#ffffff",
        },
    },
    fpsLimit: 120,
    interactivity: {
        events: {
            onClick: {
                enable: true,
                mode: ClickMode.push,
            },
            onHover: {
                enable: false,
                mode: HoverMode.repulse,
            },
            resize: true,
        },
        modes: {
            push: {
                quantity: 4,
            },
            repulse: {
                distance: 200,
                duration: 0.4,
            },
        },
    },
    particles: {
        color: {
            value: "#df1c1cff",
        },
        links: {
            color: "#d12626ff",
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 1,
        },
        move: {
            direction: MoveDirection.none,
            enable: true,
            outModes: {
                default: OutMode.bounce,
            },
            random: false,
            speed: 6,
            straight: false,
        },
        number: {
            density: {
                enable: true,
                area: 800,
            },
            value: 80,
        },
        opacity: {
            value: 0.5,
        },
        shape: {
            type: "circle",
        },
        size: {
            value: { min: 1, max: 5 },
        },
    },
    detectRetina: true,
};

  particlesLoaded(container: Container): void {
    console.log(container);
}

async particlesInit(engine: Engine): Promise<void> {
    console.log(engine);
    await loadSlim(engine);
}

  constructor(public accountService: AccountService) {
    // Debug: log when currentUser$ changes
    this.accountService.currentUser$.subscribe(user => {
      console.log('App component detected user change:', user);
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      // Wait for authentication check to complete
      await this.accountService.initializeAuth();
    } finally {
      // Hide loading spinner regardless of auth result
      this.isLoading = false;
    }
  }
}
