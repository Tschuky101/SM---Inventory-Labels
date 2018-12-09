import { Component, Input, HostListener, Inject, Injectable, OnInit } from '@angular/core';
import { FormsModule, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BaseRequestOptions, Headers } from '@angular/http';

export interface DialogData {
	removeAllLabels: false;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
@Injectable()
export class AppComponent{
	title = 'Inventory-Labels';
	author = 'Canon Tschikof';
	version = '3.0.0 - alpha 1';
	labelid = 0;
	debug = true;
	local = false;
	devices: Object = this.getherodevices();
	prices: Object = this.getheroPrices();
	DeviceTypechips: Object= this.getheroTypes();
/*
	devices = this.getherodevices();
	prices  = this.getheroPrices();
	DeviceTypechips = this.getheroTypes();
*/
	removeAllLabels: string;
	
	cardTypes = [
		{"value":"cpu", "viewValue":"Computer"},
		{"value":"ipad", "viewValue":"iPad"},
		{"value":"iphone", "viewValue":"iPhone"},
		{"value":"watch", "viewValue":"Apple Watch"},
		{"value":"tv", "viewValue":"Apple Tv"},
		{"value":"pencil", "viewValue":"Apple Pencil"},
		{"value":"hpod", "viewValue":"HomePod"}
	];
	
	labels = [];
	
	constructor(
		public dialog: MatDialog,
		private http: HttpClient	
	){}

	

	
	public getherodevices(){
		if(this.local == false ){
			var data = this.http.get('https://raw.githubusercontent.com/Tschuky101/SM-Inventory-Labels/master/inventory-labels/src/assets/devices.json', {cache:false}).subscribe(devices => this.devices = devices, err => console.log(err),() => console.log('Completed'));
		} else {
			var data = this.http.get('assets/devices.json').subscribe(devices => this.devices = devices, err => console.log(err),() => console.log('Completed'));
		}
		
		return data;
	}
	public getheroPrices(){
		if(this.local == false ){
			var data = this.http.get('https://raw.githubusercontent.com/Tschuky101/SM-Inventory-Labels/master/inventory-labels/src/assets/prices.json', {cache:false}).subscribe(prices => this.prices = prices, err => console.log(err),() => console.log('Completed'));
		} else {
			var data = this.http.get('assets/prices.json').subscribe(prices => this.prices = prices, err => console.log(err),() => console.log('Completed'));
		}
		return data;
	}
	public getheroTypes(){
		if(this.local == false ){
			var data = this.http.get('https://raw.githubusercontent.com/Tschuky101/SM-Inventory-Labels/master/inventory-labels/src/assets/DeviceTypeOptions.json', {cache:false}).subscribe(DeviceTypechips => this.DeviceTypechips = DeviceTypechips, err => console.log(err),() => console.log('Completed'));
		} else {
			var data = this.http.get('assets/DeviceTypeOptions.json').subscribe(DeviceTypechips => this.DeviceTypechips = DeviceTypechips, err => console.log(err),() => console.log('Completed'));
		}
		
		return data;
	}
	
	
	getindex(id){
		
		var labels = this.labels;
		
// 		console.log(labels);
// 		console.log("Id to search for: " + id);
		
		var index = this.labels.map(function(e){return e.id;}).indexOf(id);
// 		console.log("index: " + index);
		
		return index;
		
	}
	
	
	// Add Label to the Array
	
	addLabel() {
		
		var labeltemplate = {
			"cardType":null,
			"id":this.labelid,
			"title":null,
			"deviceType":null,
		};
		
		this.labelid++;
		this.labels.push(labeltemplate);
		
	}
	
	// Duplicate the label that the duplcate button was clicked.
	
	duplicatelabel(label){
		
		var labeltemplate = {
			"cardType":label.cardType,
			"id":this.labelid,
			"title":null,
			"deviceType":label.deviceType,
		}
		this.labelid++;
		this.labels.push(labeltemplate);
		
	}
	
	// Remove the Selected Label
	
	removelabel(labelID){

		var index = this.getindex(labelID);
		
		this.labels.splice(index, 1);
	}
	
	// Removes All labels when called by "clearLabelsPrompt()" after a dialog window is opened.
	
	public clearLabels(){
		this.labels = [];
		this.labelid = 0
	}
	
	// Opens a Dialog window to prompt user to clear all windows by giving a switch to confim removal of all created labels.
	
	clearLabelsPrompt() {
		
		let dialogRef = this.dialog.open(ClearLabelsDialog, {
			width: '400px',
			height: '300px;',
			data: {labelcount: this.labels.length, removeAllLabels: new FormControl(false)},
		});
		
		dialogRef.afterClosed().subscribe(result => {
			console.log('Dialog Closed. Result: ' + result);
			
			if (result == true){
				this.clearLabels();
			} else {
				return null;
			}
		});
	
	}
	
};

@Component({
	selector: 'ClearLabelsDialog',
	templateUrl: 'clearLabels-dialog.html',
})
export class ClearLabelsDialog {constructor(public dialogRef: MatDialogRef<ClearLabelsDialog>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}}

export class CustomRequestOptions extends BaseRequestOptions {
	// Disables HTTP cache
	headers = new Headers({
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
    });
}