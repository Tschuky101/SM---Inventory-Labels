import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder } from '@angular/forms';

export interface DialogData {
  removeAllLabels: false;
  labelcount;
  clear: false;
}
// Clear Labels Dialog Prompt
@Component({
  selector: 'app-clear-labels-dialog',
  templateUrl: 'clear-labels-dialog.component.html'
})
export class ClearLabelsDialogComponent {
  removeAllLabels = false;
  labelcount = 0;
  clear = false;

  constructor(
    public dialogRef: MatDialogRef<ClearLabelsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private formBuilder: FormBuilder
  ) {}
}
