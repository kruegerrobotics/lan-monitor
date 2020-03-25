import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormBuilder, FormGroup } from '@angular/forms';
import { NmapArgDataShareService, NmapArgs} from '../nmap-arg-data-share.service'
@Component({
  selector: 'app-config-dialog',
  templateUrl: './config-dialog.component.html',
  styleUrls: ['./config-dialog.component.css']
})
export class ConfigDialogComponent implements OnInit {

  form: FormGroup;
  scanInfo : NmapArgs;

  constructor(
    private nmapArgsService: NmapArgDataShareService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ConfigDialogComponent>,
    
    @Inject(MAT_DIALOG_DATA) data) {

    //service to exchange parameter data
    this.nmapArgsService.sharedMessage.subscribe(message => this.scanInfo = message)
  }

  ngOnInit() {
    this.form = this.fb.group({
      ipRange: [this.scanInfo.ipRange, []],
      parameters : [this.scanInfo.parameters, []],
      scanInterval : [this.scanInfo.scaninterval, []]
    });
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();    
  }
}
