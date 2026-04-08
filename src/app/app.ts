import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './ui/components/header/header';
import { FooterComponent } from './ui/components/footer/footer';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent, FooterComponent],
    templateUrl: './app.html',
    styleUrls: ['./app.scss']
})
export class AppComponent {
    title = 'blog-app';
}