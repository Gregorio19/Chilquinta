import { NgModule }            from '@angular/core';
import { RouterModule }        from '@angular/router';

import { P404Component }    from './404.component';

@NgModule({
  imports: [RouterModule.forChild([
    { path: '404', component: P404Component }
  ])],
  exports: [RouterModule]
})
export class P404RoutingModule {}