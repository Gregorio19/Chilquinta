import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import 'hammerjs';
import { LoginComponent } from './login/login.component';

import { SettingsService } from './services/settings.service';
import { AppRoutingModule } from './app.routing';
import { WebsocketService } from './services/Websocket.service';

import { CookieService } from 'ngx-cookie-service';
import { ConsService } from './services/Cons.service';
import { PausaComponent } from './pausa/pausa.component';

import { ModalModule, TabsModule, BsDropdownModule, CollapseModule } from 'ngx-bootstrap';

import { BreadcrumbsComponent } from './shared/breadcrumb.component';
import { NAV_DROPDOWN_DIRECTIVES } from './shared/nav-dropdown.directive';
import { SIDEBAR_TOGGLE_DIRECTIVES } from './shared/sidebar.directive';
import { FullLayoutComponent } from './layouts/full-layout.component';

import { HeaderComponent }                       from './components/header.component';
import { FooterComponent }                       from './components/footer.component';
import { SideBarComponent } from './components/sidebar.component';
import { ASideComponent } from './components/aside.component';
import { AsideToggleDirective } from './shared/aside.directive';
import { TurnoySerieComponent } from './turnoy-serie/turnoy-serie.component';
import { CustomFormsModule } from 'ng2-validation';
import { IdeditComponent } from './idedit/idedit.component'
import { RutValidator } from './validators/rut-validator.directive';
import { MotivosComponent } from './motivos/motivos.component';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DerivarSerieComponent } from './derivar-serie/derivar-serie.component';
import { PushNotificationsModule } from 'ng-push';
import { AppConfig } from './app.config';
import { HttpClientModule } from '@angular/common/http';

import { Ng2OdometerModule } from 'ng2-odometer';
import { MotivosAtencionComponent } from './motivos-atencion/motivos-atencion.component';
import { MotivosAtencionBusquedaComponent } from './motivos-atencion-busqueda/motivos-atencion-busqueda.component';

import { NgSelectModule, NG_SELECT_DEFAULT_CONFIG  } from '@ng-select/ng-select';
import { MotivosService } from './services/motivos.service';

import { LoadingModule } from 'ngx-loading';
import { ErrorComponent } from './error/error.component';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { ConfEjeComponent } from './conf-eje/conf-eje.component';
import { P404Component } from './404/404.component';
import { SimpleLayoutComponent } from './layouts/simple-layout.component';

@NgModule({
  declarations: [
    AppComponent,
    PausaComponent,
    HomeComponent,
    LoginComponent,
    FullLayoutComponent,
    SimpleLayoutComponent,
    NAV_DROPDOWN_DIRECTIVES,
    BreadcrumbsComponent,
    SIDEBAR_TOGGLE_DIRECTIVES,
    AsideToggleDirective,
    HeaderComponent,
    SideBarComponent,
    ASideComponent,        
    FooterComponent, 
    TurnoySerieComponent,  
    IdeditComponent,
    RutValidator,
    MotivosComponent,
    DerivarSerieComponent,
    MotivosAtencionComponent,
    MotivosAtencionBusquedaComponent,
    ErrorComponent,
    ConfEjeComponent,
    P404Component
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ModalModule.forRoot(),
    CollapseModule.forRoot(), 
    BsDropdownModule.forRoot(),    
    TabsModule.forRoot(),
    CustomFormsModule,
    NgxDatatableModule,
    PushNotificationsModule,
    Ng2OdometerModule.forRoot(),
    NgSelectModule,
    LoadingModule
  ],
  providers: [
    AppConfig,
      { 
        provide: APP_INITIALIZER, 
        useFactory: (
          config: AppConfig) => () => config.load(), 
        deps: [AppConfig], multi: true 
      },
    CookieService,
    SettingsService,
    //WebsocketService,    
    ConsService,
    MotivosService,
    {
      provide: NG_SELECT_DEFAULT_CONFIG,
      useValue: {
          notFoundText: 'No hay Tramites frecuentes',
          loadingText: "Cargando..."
      }
    }

   
  ],
  bootstrap: [AppComponent],
  exports: [
    RutValidator,
    PausaComponent,
    LoginComponent,
    TurnoySerieComponent, 
    DerivarSerieComponent,
    IdeditComponent,
    MotivosComponent,    
    MotivosAtencionComponent,
    MotivosAtencionBusquedaComponent,
    ErrorComponent,
    P404Component,
    ConfEjeComponent
  ],
  entryComponents: [
    PausaComponent,
    LoginComponent,
    TurnoySerieComponent, 
    DerivarSerieComponent,
    IdeditComponent,
    MotivosComponent,
    MotivosAtencionComponent,
    MotivosAtencionBusquedaComponent,
    ErrorComponent,
    ConfEjeComponent
  ]
})
export class AppModule { }
