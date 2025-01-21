import { NgModule } from '@angular/core'; // Importing NgModule
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http'; 
import { RouterModule, Routes } from '@angular/router';  // Importing RouterModule for routing

import { AppComponent } from './app.component';
import { TasksComponent } from './tasks/tasks.component';  // Importing Standalone TasksComponent

const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'tasks', component: TasksComponent }
];

@NgModule({
  declarations: [
    AppComponent
    // No need to declare TasksComponent here since it is standalone
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    TasksComponent // Importing the standalone TasksComponent here
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
