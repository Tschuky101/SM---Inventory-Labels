import { Component, Input, HostListener, Inject, Injectable, OnInit, NgZone, } from '@angular/core';
import { FormsModule, FormControl, FormGroup, FormBuilder, FormArray, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FileSaverService } from 'ngx-filesaver';
import { Observable } from 'rxjs';
import { map, filter, scan, startWith, retry, catchError } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';
import { BaseRequestOptions, Headers } from '@angular/http';

import { Devices, DevicesService } from './services/dataservices.service';
import { FilterYears, FilterSizes } from './services/pipes';
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

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [ DevicesService, FilterYears, FilterSizes ],
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
	parsedResult: any;
	array: any;
	models: Object[] = [];
	years: Object[] = [];
	sizes: Object[] = [];
	carriers: Object[] = ["Unlocked","Verizon","AT&T","Sprint","T-Mobile"];

	/******
		Form Creation & Validation for labels
	******/
	priceValidator = "^\\\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)*\\.[9][0-9]$";
	labelsForm: FormGroup;
	matcher = new MyErrorStateMatcher();

	public constructor(
		private _FileSaverService: FileSaverService,
		private devicesService: DevicesService,
		public dialog: MatDialog,
		private http: HttpClient,
		private zone: NgZone,
		private filterYears: FilterYears,
		private filterSizes: FilterSizes,
		// private fb: FormBuilder,
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
			this.getSizes();
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

			Form Creation on page load
		******/
		this.labelsForm = new FormGroup({
			label: new FormArray([])
		});

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
		// Sort Function to sort devices alphanumericly
		this.models.sort(function(a,b){
			let nameA = a['name'].toUpperCase();
			let nameB = b['name'].toUpperCase();

			if(nameA < nameB){
				return - 1;
			}
			if(nameA > nameB){
				return 1;
			}
			return 0;
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

		});

		this.years.sort(function(a,b){
			let yearA = a['year'];
			let yearB = b['year'];
			let valueA = parseInt(yearA.match(/[0-9]+/));
			let valueB = parseInt(yearB.match(/[0-9]+/));

			if(valueA < valueB){
				return 1;
			}
			if(valueA > valueB){
				return -1;
			}
			return 0;
		});
		console.log(this.years);
	}
	getSizes(){
		// Generate all Sizes for all devices in devices.json
		this.devices.forEach(device => {
			var template = {
				"size": device.size,
				"models": [],
				"years": []
			}
			if(this.isInArray(device.size, this.sizes, 'size') == false){
				this.sizes.push(template);
			}
		});

		// Match all devices to their size and add them to the models array for that size
		this.devices.forEach(device => {
			let index = this.getindex(device.size, this.sizes, 'size');
			for(let i=0; i<this.sizes.length; i++){
				if(device.size == this.sizes[i]['size']){
					// console.log("Current Device Size == "+device.size);
					if(this.sizes[i]['models'].length == 0){
						// console.log("Current Size of this.sizes["+i+"]['models']: "+this.sizes[i]['models'].length);
						this.sizes[i]['models'].push(device.name);
						break;
					} else {
						for(let j=0; j<this.sizes[i]['models'].length; j++){

							let doesModelExistInArray = this.sizes[i]['models'].includes(device.name);

							if(doesModelExistInArray == true){
								// console.log("Current Device: "+device.name);
								// console.log("Device Exists on size: "+device.size);
							} else {
								// console.log("Current Device: "+device.name);
								// console.log("Device doesn't exist on size: "+device.size);
								this.sizes[i]['models'].push(device.name);
								break;
							}
						}
					}
				}
			}
		});

		// Match all devices to their size and add them to the years array for that size
		this.devices.forEach(device => {
			for(let i=0; i<this.sizes.length; i++){
				let currentSizeToCheck = this.sizes[i]['size']; // Used for Debugging Purposes
				let currentDevice = device.name;
				let deviceBeingCheckedSize = device.size;
				let deviceSizeMatchesCurrentSizeBeingChecked = false;
				let yearExistsOnSize = false;
				console.log("Device info loaded");


				if(deviceBeingCheckedSize == currentSizeToCheck){

					deviceSizeMatchesCurrentSizeBeingChecked = true;
					console.log("Device Matches Size Being Checked");
					// if(this.sizes[i]['years'].length == 0){
					// 	this.sizes[i]['years'].push(device.year);
					// 	break;
					// } else {
						for(let j=0; j<=this.sizes[i]['years'].length; j++){

							let currentYearToCheck = this.sizes[i]['years'][j];
							let deviceBeingCheckedYear = device.year;
							let doesCurrentDeviceExistInArray = this.sizes[i]['years'].includes(deviceBeingCheckedYear);

							if(this.sizes[i]['years'].includes(deviceBeingCheckedYear) == true){
								yearExistsOnSize = true;
								console.log("Year Exists on size being Checked.");

								// console.log(this.sizes[0]);
							}
							if(this.sizes[i]['years'].includes(deviceBeingCheckedYear) == false) {
								yearExistsOnSize = false;
								console.log("Year doesn't exists on size being Checked.");
								this.sizes[i]['years'].push(device.year);
								break;
							}
						}
					// }
				}
			}
		});

		console.log(this.sizes);
	}


	/******
		Add, Remove, and Duplicate Functions Label functions
	******/
	// Generate Random ID for Labels
	// Length of ID is defined when the function is called.
	createID(){
		var length = 15;
		return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
	}

	// Add Label to the Array
	public addLabel() {
		const label = this.labelsForm.controls.label as FormArray;
		let template = new FormGroup({
			cardType: new FormGroup({
				type: new FormControl(null),
				viewValue: new FormControl(null)
			}),
			id: new FormControl(this.createID()),
			condition: new FormControl(null),
			receivedOn: new FormControl(new Date(), Validators.required),
			generatedOn: new FormControl(new Date()),
			device: new FormControl(null),
			year: new FormControl(null),
			size: new FormControl(null),
			price: new FormControl(null, Validators.compose([Validators.required, Validators.pattern(this.priceValidator)])),
			touchbar: new FormControl(false)
		});
		label.push(template);
		// 	"generation":null,
		// 	"color":null,
		// 	"material":null,
		// 	"touchbar":null,
		// 	"screenSize":null,
		// 	"processor":null,
		// 	"storage":null,
		// 	"ram":null,
		// 	"cellular":null,
		// 	"serial":null
		// }))
		// this.labels.push(labeltemplate);

		console.log(this.labelsForm);
	}
	// Duplicate the label that the duplcate button was clicked.
	duplicatelabel(index){

		this.addLabel();
		let addedLabelIndex = this.labelsForm.controls.label['value'].length - 1;
		console.log(addedLabelIndex);
		this.labelsForm.controls.label['controls'][addedLabelIndex]['controls']['cardType'].get('type').setValue(this.labelsForm.controls.label['controls'][index]['controls']['cardType'].get('type').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex]['controls']['cardType'].get('viewValue').setValue(this.labelsForm.controls.label['controls'][index]['controls']['cardType'].get('viewValue').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('id').setValue(this.createID());
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('condition').setValue(this.labelsForm.controls.label['controls'][index].get('condition').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('receivedOn').setValue(this.labelsForm.controls.label['controls'][index].get('receivedOn').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('generatedOn').setValue(new Date());
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('device').setValue(this.labelsForm.controls.label['controls'][index].get('device').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('year').setValue(this.labelsForm.controls.label['controls'][index].get('year').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('size').setValue(this.labelsForm.controls.label['controls'][index].get('size').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('price').setValue(this.labelsForm.controls.label['controls'][index].get('price').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('touchbar').setValue(this.labelsForm.controls.label['controls'][index].get('touchbar').value);
// 		this.labels.push(labeltemplate);
		console.log("Label Added");
	}
	// Remove the Selected Label
	removelabel(index){
		console.log("Removing Label at index: "+index);

		// var index = this.getindex(labelID, this.labelsForm.controls.labels.value, 'id');

		(<FormArray>this.labelsForm.controls.label).removeAt(index);
	}
	// Removes All labels when called by "clearLabelsPrompt()" after a dialog window is opened.
	public clearLabels(){
		const label = this.labelsForm.controls.label as FormArray;
		label.reset();

		console.log("Array Status Reset");

		console.log("Clearing Lables");
		this.labelsForm = new FormGroup({
			label: new FormArray([])
		});
	}
	// Opens a Dialog window to prompt user to clear all windows by giving a switch to confim removal of all created labels.
	clearLabelsPrompt() {

		let dialogRef = this.dialog.open(ClearLabelsDialog, {
			width: '400px',
			height: '300px;',
			data: {labelcount: this.labelsForm.controls.label.value.length, removeAllLabels: new FormControl(false)},
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

			let parsedResult = JSON.parse(result);

			this.clearLabels();

			parsedResult.label.forEach((label, index) => {
				this.addLabel();
				this.labelsForm.controls.label['controls'][index]['controls']['cardType'].get('type').setValue(label['cardType']['type']);
				this.labelsForm.controls.label['controls'][index]['controls']['cardType'].get('viewValue').setValue(label['cardType']['viewValue']);
				this.setValidation(index, label['cardType']['type'], label['condition']);
				this.labelsForm.controls.label['controls'][index].get('id').setValue(label['id']);
				this.labelsForm.controls.label['controls'][index].get('condition').setValue(label['condition']);
				this.labelsForm.controls.label['controls'][index].get('receivedOn').setValue(label['receivedOn']);
				this.labelsForm.controls.label['controls'][index].get('generatedOn').setValue(new Date());
				this.labelsForm.controls.label['controls'][index].get('device').setValue(label['device']);
				this.labelsForm.controls.label['controls'][index].get('year').setValue(label['year']);
				this.labelsForm.controls.label['controls'][index].get('size').setValue(label['size']);
				this.labelsForm.controls.label['controls'][index].get('price').setValue(label['price']);
				this.labelsForm.controls.label['controls'][index].get('touchbar').setValue(label['touchbar']);

			});

			// this.labelsForm.setValue(parsedResult);

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
