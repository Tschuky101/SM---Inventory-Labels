import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface JsonDialogData {
  file: string;
  saveFileData: string;
}
@Component({
  selector: 'app-load-json',
  templateUrl: 'load-json.component.html',
  styleUrls: ['./load-json.component.scss']
})
export class LoadJsonComponent {
  file: string;
  public saveFileData;

  constructor(
    public dialogRef: MatDialogRef<LoadJsonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: JsonDialogData
  ) {}

  upload(): void {
    const files = (document.getElementById('saveFile') as HTMLInputElement).files[0];
    const fr: FileReader = new FileReader();

    fr.onload = e => {
      console.log('Starting File Read');

      this.dialogRef.close(fr.result);
    };

    const data = fr.readAsText(files);

    // this.dialogRef.close(fr.result);
  }
}
