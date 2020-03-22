import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MaterialModule} from './material.module';
import { NetworkdeviceComponent } from './networkdevice/networkdevice.component';
import { ConfigDialogComponent } from './config-dialog/config-dialog.component';

import { ReactiveFormsModule } from '@angular/forms';

import {NmapArgDataShareService} from './nmap-arg-data-share.service'

@NgModule({
  declarations: [
    AppComponent,
    NetworkdeviceComponent,
    ConfigDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  providers: [NmapArgDataShareService],
  bootstrap: [AppComponent],
  entryComponents: [ConfigDialogComponent]
})
export class AppModule { }
