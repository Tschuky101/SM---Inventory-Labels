import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
	title = 'Inventory-Labels';
	author = 'Canon Tschikof';
	version = '3.0.0 - alpha 1';
	
	labels = [
		{"title":"Test"},
		{"title":"Test2"}
	];
	
	public addLabel() : void {
		labeltemplate = [
			{"title":"Test"}
		];
		
		labels.push(labeltemplate);
	}
}
