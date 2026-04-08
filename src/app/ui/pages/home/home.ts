import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [],
    templateUrl: './home.html',
    styleUrls: ['./home.scss']
})
export class HomeComponent {
    constructor(private router: Router) {}

    goToBlog(): void {
        this.router.navigate(['/blog']);
    }
}