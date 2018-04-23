import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';

//import { LoginComponent } from './login/login.component';
//import { PausaComponent } from './pausa/pausa.component';
import { FullLayoutComponent } from './layouts/full-layout.component';
import { P404Component } from './404/404.component';

export const routes: Routes = [  
  {
    path: '',
    component: FullLayoutComponent, 
    children: [
    {
      path: '', 
      component: HomeComponent
    },        
  ]},
  { path: '**', component: P404Component }
];

@NgModule({
  imports: [RouterModule.forRoot(
    routes,  { useHash: true }
    //{ enableTracing: true } // <-- debugging purposes only
  )],
  exports: [RouterModule]
})
export class AppRoutingModule {}