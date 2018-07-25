import { Component, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { ConsService } from '../services/Cons.service';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './full-layout.component.html',
  styleUrls: ['./full-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FullLayoutComponent  implements OnInit {

  ngOnInit(): void {
    
  }
  constructor(    
    public settings: SettingsService,
  ) {
    
  }
}

