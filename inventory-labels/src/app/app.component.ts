import { Component, Input, HostListener, Inject, Injectable, OnInit, NgZone,  Pipe, PipeTransform } from '@angular/core';
import { FormsModule, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FileSaverService } from 'ngx-filesaver';
import { Observable } from 'rxjs';
import { map, filter, scan, startWith, retry, catchError } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BaseRequestOptions, Headers } from '@angular/http';

import { Devices, DevicesService} from './services/dataservices.service'
//import { ElectronService } from 'ngx-electron';

// Used to import ClearDialog confirmation
export interface DialogData {
	removeAllLabels: false;
}

// Used to import Json Data
export interface JsonDialogData {
	file: string;
	saveFileData: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [ DevicesService ],
  styleUrls: ['./app.component.scss']
})
@Injectable()
export class AppComponent{

	/******
		VARIABLES
	******/

	title = 'Simply Mac Inventory Labels';
	author = 'Canon Tschikof';
	version = '3.1.0 - alpha 1';
	debug = false;
	local = true;
	devices: Array<any>;
	prices: Array<any>;
	DeviceConditions: Array<any>;
	cardTypes: Array<any>;
	removeAllLabels: string;
	labels = [];
	parsedResult: any;
	array: any;
	models: Object[] = [];
	years: Object[] = [];

	//isAnElectronApp: boolean = this._electronService.runningInElectron;



	public constructor(
		private _FileSaverService: FileSaverService,
		private devicesService: DevicesService,
		public dialog: MatDialog,
		private http: HttpClient,
		private zone: NgZone
	){

		// Functions exposed outside of App.
		// to call function run "window.nameoffunction.zone.run(() => {window.nameoffunction.componentFn();})"
		window['addLabelfromMenu'] = {
			zone: this.zone,
			componentFn: () => this.addLabel(),
			component: this
		};
		window['clearLabelsfromMenu'] = {
			zone: this.zone,
			componentFn: () => this.clearLabelsPrompt(),
			component: this
		};

		/******
			Get Either the local or remote JSON files for loading into the app. This method is determinded by the variable 'this.local'. this is defined in app.component.ts
		******/

		// Load Devices and initialize dropdown arrays, and pass along if we are loading from local or remote data
		this.devicesService.getDevices(this.local).subscribe((data: Array<any>) => {
			this.devices = data;
			this.getModel();
			this.getYears();
		});

		// Load Pricing information and pass along if we are loading from local or remote data
		this.devicesService.getPrices(this.local).subscribe((data: Array<any>) => {
			this.prices = data;
		});

		// Load Device condition states and pass along if we are loading from local or remote data
		this.devicesService.getCondition(this.local).subscribe((data: Array<any>) => {
			this.DeviceConditions = data;
		});

		// Load CardTypes and pass along if we are loading from local or remote data
		this.devicesService.getCardTypes(this.local).subscribe((data: Array<any>) => {
			this.cardTypes = data;
		});

		/******
			End data loading section
		******/

	}

	/******
		Helper Functions
	******/
	// Checks if value is in Array
	isInArray(value, array, key) {
		var search = array.filter(function(e) {return e[key] === value});
		return search;
	}
	// Gets Index of item
	getindex(search, array, key){
		var index = array.map(function(e){return e[key];}).indexOf(search);
		return index;
	}

	/******
		Dynamically Pull Data from Array for form fields
	******/
	getModel(){
		if(this.debug == true){
			console.log("GetModel()");
			console.log(this.devices);
			console.log("this.devices length = " + this.devices.length);
		}
		this.devices.forEach(device => {
			var template = {
				"name": device.name,
				"device": device.device
			};
			if (this.isInArray(device.name, this.models, 'name') == false){
				this.models.push(template);
			}
		});
		if(this.debug == true){
			console.log("After ForEach loop");
			console.log(this.models);
		}
	}
	getYears(){
		// Generate All the Possible Years that exits in devices.json
		this.devices.forEach(device => {
			if(this.isInArray(device.year, this.years, 'year') == false){ // Checks to see if current year is in the array this.years and adds the year if it is not in the array.
				let template = {
					"year":device.year,
					"models": [],
				}
				this.years.push(template);

			}
		});

		// Add Devices to the years that they were made in. These are added at this.years[index][models].
		this.devices.forEach(device=>{
			let index = this.getindex(device.year, this.years, 'year');
			for(let i=0; i<this.years.length; i++){
				if(device.year == this.years[i]['year']){ // Check to see if the device year is equal to the year that the for loop is on.
					if(this.years[i]['models'].length == 0){ // Checks to see if there is any data in this.years[index]['models']. If not pushes current device into array.
						this.years[i]['models'].push(device.name);
					} else {
						for(let j=0; j<this.years[i]['models'].length; j++){ // Loops through each device in this.years[index]['modes']

							if(device.name === this.years[i]['models']){ // Adds current device to this.years[index]['models'] if the device isn't currently in the array
								console.log("device Exists");
							} else {
								this.years[i]['models'].push(device.name);
								break;
							}
						}
					}
				}
			}

		})
	}


	/******
		Add and Remove Label functions
	******/
	// Generate Random ID for Labels
	// Length of ID is defined when the function is called.
	createID(){
		var length = 15;
		return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
	}

	// Add Label to the Array
	public addLabel(): any {

		// console.log(this.devices);
		var labeltemplate = {
			"cardType":[{"type":null, "viewValue":null }],
			"id":this.createID(),
			"condition":null,
			"receivedOn":new Date(),
			"device":[{"name":null, "device":null}],
			"year":null,
			"generation":null,
			"color":null,
			"material":null,
			"touchbar":null,
			"screenSize":null,
			"processor":null,
			"storage":null,
			"ram":null,
			"cellular":null,
			"serial":null

		};

		this.labels.push(labeltemplate);

	}
	// Duplicate the label that the duplcate button was clicked.
	duplicatelabel(label){

		var labeltemplate = {
			"cardType":[{"type":label.cardType, "viewValue":label.cardTypeNice }],
			"id":this.createID(),
			"condition":label.condition,
		}
// 		this.labels.push(labeltemplate);
		console.log("not Implemented Yet");
	}
	// Update Values in Labels Array
	updateValue(id, key, value){
		let index = this.labels.map(function(e){return e.id;}).indexOf(id);

		if(this.debug == true){
			console.log("Changing " + key + " to:");
			console.log("id: " + id + ", key: " + key + ", value:" + JSON.stringify(value));
		}

		this.labels[index][key] = value;
	}

	// Remove the Selected Label
	removelabel(labelID){

		var index = this.getindex(labelID, this.labels, 'id');

		this.labels.splice(index, 1);
	}

	// Removes All labels when called by "clearLabelsPrompt()" after a dialog window is opened.
	public clearLabels(){
		this.labels = [];
	}

	// Opens a Dialog window to prompt user to clear all windows by giving a switch to confim removal of all created labels.
	clearLabelsPrompt() {

		let dialogRef = this.dialog.open(ClearLabelsDialog, {
			width: '400px',
			height: '300px;',
			data: {labelcount: this.labels.length, removeAllLabels: new FormControl(false)},
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result == true){
				this.clearLabels();
			} else {
				return null;
			}
		});

	}

	save(type: string, fromRemote: boolean) {

		var filenameDate = new Date();
		let filename =  filenameDate + `.${type}`;
		var parsedJson = JSON.stringify(this.labels);
		var fileType = this._FileSaverService.genType(filename);
		var txtBlob = new Blob([parsedJson], { type: fileType });
		this._FileSaverService.save(txtBlob, filename);

	}

	load() : void{
		// Used to load saved json file data for saved labels.
		let dialogRef = this.dialog.open(loadjson, {
			width: '400px',
			height: '400px;',
			data: {file: new FormControl(), saveFileData: new FormControl()},
		});

		dialogRef.afterClosed().subscribe(result => {

			this.parsedResult = JSON.parse(result);

			this.labels = this.parsedResult;

		});


	}

};

// Clear Labels Dialog Prompt
@Component({
	selector: 'ClearLabelsDialog',
	templateUrl: 'clearLabels-dialog.html',
})
export class ClearLabelsDialog {
	constructor(public dialogRef: MatDialogRef<ClearLabelsDialog>, @Inject(MAT_DIALOG_DATA) public data: DialogData, private formBuilder: FormBuilder) {}
}

@Component({
	selector: 'loadjson',
	templateUrl: 'loadjson.html',
	styleUrls: ['./app.component.scss']
})
export class loadjson {

	file: string;
	public saveFileData;

	constructor(
		public dialogRef: MatDialogRef<loadjson>,
		@Inject(MAT_DIALOG_DATA) public data: JsonDialogData
	) {}

	upload(): void{

		var files = (document.getElementById('saveFile') as HTMLInputElement).files[0];

		var fr: FileReader = new FileReader();

		fr.onload = (e) => {
			console.log("Starting File Read");

			this.dialogRef.close(fr.result);

		}

		var data = fr.readAsText(files);

		//this.dialogRef.close(fr.result);

	}


}

@Pipe({
	name: 'DisplayModels'
})
export class DisplayModels {

	transform(value: any, type: any){
		let tempArray = []

		value.forEach((option, index) =>{
			if (value[index].device == type){
				let template = {
					"name": value[index].name,
					"device": value[index].device
				};
				tempArray.push(template);
			}
		});

		return tempArray;
	}
}
@Pipe({
	name: 'FilterYears'
})
export class FilterYears {
	transform(value: any, modelToFilter: any){

		var tempArray = [];

		value.forEach((option, index) => {

			let currentYear = option.year;

			option['models'].forEach(model => {

				if(model == modelToFilter){
					let template = {
						"year":currentYear
					};

					tempArray.push(template);

				}

			})

		})

		return tempArray;

	}
}
