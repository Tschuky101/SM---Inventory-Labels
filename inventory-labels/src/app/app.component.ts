/******
 * Load in Library Files for app.component.ts
 ******/
import { Component, Injectable, NgZone } from "@angular/core";
import { MatDialog } from "@angular/material";
import { FormControl, FormGroup, FormArray, FormGroupDirective, NgForm, Validators } from "@angular/forms";
import { FileSaverService } from "ngx-filesaver";
import { ErrorStateMatcher } from "@angular/material/core";

/******
 * Load Services and other compoents for app.component.ts
 ******/
import { DevicesService } from "./services/dataservices.service";
import { FilterYears } from "./pipes/filteryears.pipe";
import { FilterSizes } from "./pipes/filtersizes.pipe";
import { FilterColors } from "./pipes/filtercolors.pipe";
import { LoadJsonComponent } from "./dialogs/load-json.component";
import { ClearLabelsDialogComponent } from "./dialogs/clear-labels.component";

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
	providers: [ DevicesService, FilterYears, FilterSizes, FilterColors ],
	styleUrls: ['./app.component.scss']
})
@Injectable()
export class AppComponent {
	/******
	 * VARIABLES
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
	colors: Object[] = [];
	carriers: Object[] = [ "Unlocked", "Verizon", "AT&T", "Sprint", "T-Mobile"];

	/******
	 * Form Creation & Validation for labels
	 ******/
	priceValidator = "^\\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)*\\.[9][0-9]$";
	labelsForm: FormGroup;
	matcher = new MyErrorStateMatcher();

	public constructor(
		private _FileSaverService: FileSaverService,
		private devicesService: DevicesService,
		public dialog: MatDialog,
		private zone: NgZone,
		private filterYears: FilterYears,
		private filterSizes: FilterSizes,
		private filterColors: FilterColors
	) {
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
		 * Get Either the local or remote JSON files for loading into the app.
		 * This method is determinded by the variable 'this.local'. this is defined in app.component.ts
		 ******/
		// Load Devices and initialize dropdown arrays, and pass along if we are loading from local or remote data
		this.devicesService.getDevices(this.local).subscribe((data: Array<any>) => {
			this.devices = data;
			this.getModel();
			this.getYears();
			this.getSizes();
			this.getColors();
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
		 * End data loading section
		 *
		 * Form Creation on page load
		 ******/
		this.labelsForm = new FormGroup({
			label: new FormArray([])
		});
	}

	/******
	 * Helper Functions
	 ******/
	// Checks if value is in Array
	isInArray(value, array, key) {
		const search = array.filter(function(e) {
			return e[key] === value;
		});
		return search;
	}
	// Gets Index of item
	getindex(search, array, key) {
		const index = array.map(function(e) {return e[key]; }).indexOf(search);
		return index;
	}

	/******
	 * Dynamically Pull Data from Array, and build dropdown lists
	 ******/
	getModel() {
		if (this.debug === true) {
			console.log("GetModel()");
			console.log(this.devices);
			console.log("this.devices length = " + this.devices.length);
		}
		this.devices.forEach(device => {
			const template = {
				name: device.name,
				device: device.device
			};
			if (this.isInArray(device.name, this.models, "name") == false) {
				this.models.push(template);
			}
		});
		// Sort Function to sort devices alphanumericly
		this.models.sort(function(a, b) {
			const nameA = a["name"].toUpperCase();
			const nameB = b["name"].toUpperCase();

			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
			return 0;
		});

		console.log("Models Array");
		console.log(this.models);
	}
	getYears() {
		// Generate All the Possible Years that exits in devices.json
		this.devices.forEach(device => {
			if (this.isInArray(device.year, this.years, "year") == false) {
				// Checks to see if current year is in the array this.years and adds the year if it is not in the array.
				const template = {
					year: device.year,
					models: []
				};
				this.years.push(template);
			}
		});

		// Add Devices to the years that they were made in. These are added at this.years[index][models].
		this.devices.forEach(device => {
			for (let i = 0; i < this.years.length; i++) {
				if (device.year == this.years[i]['year']) {
					// Check to see if the device year is equal to the year that the for loop is on.
					if (this.years[i]['models'].length == 0) {
						// Checks to see if there is any data in this.years[index]['models']. If not pushes current device into array.
						this.years[i]['models'].push(device.name);
						// break;
					} else {
						for (let j = 0; j < this.years[i]['models'].length; j++) {
							// Loops through each device in this.years[index]['modes']

							const doesModelExistInArray = this.years[i]['models'].includes(device.name);

							if (doesModelExistInArray == false) {
								this.years[i]['models'].push(device.name);
								break;
							}
						}
					}
				}
			}
		});

		this.years.sort(function(a, b) {
			const yearA = a['year'];
			const yearB = b['year'];
			const valueA = parseInt(yearA.match(/[0-9]+/), 10);
			const valueB = parseInt(yearB.match(/[0-9]+/), 10);

			if (valueA < valueB) {
				return 1;
			}
			if (valueA > valueB) {
				return -1;
			}
			return 0;
		});
		console.log('Years Array');
		console.log(this.years);
	}
	getSizes() {
		// Generate all Sizes for all devices in devices.json
		this.devices.forEach(device => {
			const template = {
				size: device.size,
				models: [],
				years: []
			};
			if (this.isInArray(device.size, this.sizes, 'size') == false) {
				this.sizes.push(template);
			}
		});

		// Match all devices to their size and add them to the models array for that size
		this.devices.forEach(device => {
			for (let i = 0; i < this.sizes.length; i++) {
				if (device.size == this.sizes[i]['size']) {
					// console.log("Current Device Size == "+device.size);
					if (this.sizes[i]['models'].length == 0) {
						// console.log("Current Size of this.sizes["+i+"]['models']: "+this.sizes[i]['models'].length);
						this.sizes[i]['models'].push(device.name);
						break;
					} else {
						for (let j = 0; j < this.sizes[i]['models'].length; j++) {
							const doesModelExistInArray = this.sizes[i]['models'].includes(device.name);

							if (doesModelExistInArray == false) {
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
			for (let i = 0; i < this.sizes.length; i++) {
				const currentSizeToCheck = this.sizes[i]['size']; // Used for Debugging Purposes
				const deviceBeingCheckedSize = device.size;
				let deviceSizeMatchesCurrentSizeBeingChecked = false;
				let yearExistsOnSize = false;

				if (deviceBeingCheckedSize == currentSizeToCheck) {
					deviceSizeMatchesCurrentSizeBeingChecked = true;

					for (let j = 0; j <= this.sizes[i]['years'].length; j++) {
						const deviceBeingCheckedYear = device.year;

						if (this.sizes[i]['years'].includes(deviceBeingCheckedYear) == false) {
							yearExistsOnSize = false;
							this.sizes[i]['years'].push(device.year);
							break; // DO NOT REMOVE. This is required to prevent an infinite loop
						}
					}
				}
			}
		});

		this.sizes.sort(function (a, b) {
			const yearA = a['size'];
			const yearB = b['size'];
			const valueA = parseInt(yearA.match(/[0-9]+/), 10);
			const valueB = parseInt(yearB.match(/[0-9]+/), 10);

			if (valueA > valueB) {
				return 1;
			}
			if (valueA < valueB) {
				return -1;
			}
			return 0;
		});

		console.log('Sizes array');
		console.log(this.sizes);
	}
	getColors() {
		// Add Color to this.colors array if the color doesn't already exist
		this.devices.forEach(device => {
			// console.log(device.colors);
			device.colors.forEach((color) => {
				const template = {
					name: color,
					models: [],
					years: [],
					sizes: []
				};
				if (this.isInArray(color, this.colors, "name") == false) {
					// tslint:disable-next-line: quotemark
					// console.log("Color Doesn't Exist");
					this.colors.push(template);
				}
				// console.log(color);
			});
		});

		// Add Models to the color array if the model doesn't already exist on this.colors[index]['models'] array
		this.devices.forEach(device => {
			device.colors.forEach(deviceColor => {
				this.colors.forEach((color, index) => {
					if (deviceColor == color['name']) {
						const isDeviceinArray = this.colors[index]['models'].includes(device.name);
						if (isDeviceinArray == false || this.colors[index]['models'].length == 0) {
							this.colors[index]['models'].push(device.name);
						}
					} else {
					}
				});
			});
		});

		// Add Size to the color array if the model doesn't already exist on this.colors[index]['Size'] array
		this.devices.forEach(device => {
			device.colors.forEach(deviceColor => {
				this.colors.forEach((color, index) => {
					if (deviceColor == color['name']) {
						const isDeviceYearInArray = this.colors[index]['years'].includes(device.year);
						if (isDeviceYearInArray == false || this.colors[index]['years'].length == 0) {
							this.colors[index]['years'].push(device.year);
						}
					}
				});
			});
		});

		// Add Year to the color array if the model doesn't already exist on this.colors[index]['Year'] array
		this.devices.forEach(device => {
			device.colors.forEach(deviceColor => {
				this.colors.forEach((color, index) => {
					if (deviceColor == color['name']) {
						const isDeviceSizeInArray = this.colors[index]['sizes'].includes(device.size);
						if (isDeviceSizeInArray == false || this.colors[index]['sizes'].lenght == 0) {
							this.colors[index]['sizes'].push(device.size);
						}
					}
				});
			});
		});

		this.colors.sort(function(a, b) {
			const nameA = a['name'].toUpperCase();
			const nameB = b['name'].toUpperCase();

			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
			return 0;

		});

		console.log("Colors Array");
		console.log(this.colors);
	}

	/******
	 * Add, Remove, and Duplicate Functions Label functions
	 ******/
	// Generate Random ID for Labels
	// Length of ID is defined when the function is called.
	createID() {
		const length = 15;
		return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1);
	}

	// Add Label to the Array
	public addLabel() {
		const label = this.labelsForm.controls.label as FormArray;
		const template = new FormGroup({
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
			price: new FormControl(
				null,
				Validators.compose([
					Validators.required,
					Validators.pattern(this.priceValidator)
				])
			),
			color: new FormControl(null),
			touchbar: new FormControl(false)
		});
		label.push(template);
		// 	"generation":null,
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
	duplicatelabel(index) {
		this.addLabel();
		const addedLabelIndex = this.labelsForm.controls.label["value"].length - 1;
		this.labelsForm.controls.label['controls'][addedLabelIndex]['controls']['cardType'].get('type').setValue(
			this.labelsForm.controls.label['controls'][index]['controls']['cardType'].get('type').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex]['controls']['cardType'].get('viewValue').setValue(
			this.labelsForm.controls.label['controls'][index]['controls']['cardType'].get('viewValue').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('id').setValue(this.createID());
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('condition').setValue(
			this.labelsForm.controls.label['controls'][index].get('condition').value);

		// Set Validatoin for FormContols after label type and device condition have been set
		this.setValidation(
			addedLabelIndex,
			this.labelsForm.controls.label['controls'][addedLabelIndex]['controls']['cardType'].get('type').value,
			this.labelsForm.controls.label['controls'][addedLabelIndex].get('condition').value
		);

		// Continue Setting label data
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('receivedOn').setValue(
			this.labelsForm.controls.label['controls'][index].get('receivedOn').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('generatedOn').setValue(new Date());
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('device').setValue(
			this.labelsForm.controls.label['controls'][index].get('device').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('year').setValue(
			this.labelsForm.controls.label['controls'][index].get('year').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('size').setValue(
			this.labelsForm.controls.label['controls'][index].get('size').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('price').setValue(
			this.labelsForm.controls.label['controls'][index].get('price').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('color').setValue(
			this.labelsForm.controls.label['controls'][index].get('color').value);
		this.labelsForm.controls.label['controls'][addedLabelIndex].get('touchbar').setValue(
			this.labelsForm.controls.label['controls'][index].get('touchbar').value);
	}

	// Remove the Selected Label
	removelabel(index) {
		if (this.debug == true) {
			console.log("Removing Label at index: " + index);
		}
		(<FormArray>this.labelsForm.controls.label).removeAt(index);
	}

	// Removes All labels when called by "clearLabelsPrompt()" after a dialog window is opened.
	public clearLabels() {
		const label = this.labelsForm.controls.label as FormArray;
		label.reset();

		if (this.debug == true) {
			console.log("Array Status Reset");
			console.log("Clearing Lables");
		}

		this.labelsForm = new FormGroup({
			label: new FormArray([])
		});
	}

	// Opens a Dialog window to prompt user to clear all windows by giving a switch to confim removal of all created labels.
	clearLabelsPrompt() {
		const dialogRef = this.dialog.open(ClearLabelsDialogComponent, {
			width: '400px',
			height: '300px;',
			data: {
				labelcount: this.labelsForm.controls.label.value.length,
				removeAllLabels: new FormControl(false)
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result == true) {
				this.clearLabels();
			} else {
				return null;
			}
		});
	}

	/******
	 * Data Validation and Update Functions
	 ******/
	// Update Values in Labels Array
	updateValue(index, key1, key2, value) {
		if (this.debug == true) {
			console.log(this.labelsForm);
			console.log("setting Value: [" + key1 + "][" + key2 + "] to: [" + value + "]");
		}
		if (key2 == null) {
			this.labelsForm.controls.label['controls'][index]['controls'][key1].value = value;
			this.labelsForm.controls.label.value[index][key1] = value;
		} else {
			this.labelsForm.controls.label['controls'][index]['controls'][key1]['controls'][key2].value = value;
			this.labelsForm.controls.label.value[index][key1][key2] = value;
		}
	}

	deviceModelChanged(index) {
		this.disableInputYears(index);
		this.disableSizes(index);
		this.disableColors(index);
	}
	disableInputYears(index) {
		const device = this.labelsForm.controls.label['controls'][index].get('device').value;
		const tempdata = this.filterYears.transform(this.years, device);

		if (this.debug == true) {
			console.log("Input Changed on index: " + index);
			console.log("Array: ");
			console.log(this.array);
			console.log("Device to filter to: " + device);
			console.log("Year to change to: " + tempdata[0].year);
			console.log("Length of years array filtered: " + tempdata.length);
		}

		if (tempdata.length == 1) {
			this.labelsForm.controls.label['controls'][index].get('year').reset();
			this.labelsForm.controls.label['controls'][index].get('year').setValue(tempdata[0].year);
			this.disableSizes(index);
			this.disableColors(index);
		} else {
			this.labelsForm.controls.label['controls'][index].get('year').reset();
		}
	}
	disableSizes(index) {
		const device = this.labelsForm.controls.label['controls'][index].get('device').value;
		const year = this.labelsForm.controls.label['controls'][index].get('year').value;
		const tempdata = this.filterSizes.transform(this.sizes, device, year);

		if (tempdata.length == 1) {
			this.labelsForm.controls.label['controls'][index].get('size').reset();
			this.labelsForm.controls.label['controls'][index].get('size').setValue(tempdata[0].size);
			this.disableColors(index);
		} else {
			this.labelsForm.controls.label['controls'][index].get('size').reset();
		}
	}
	disableColors(index) {
		const device = this.labelsForm.controls.label['controls'][index].get('device').value;
		const year = this.labelsForm.controls.label['controls'][index].get('year').value;
		const size = this.labelsForm.controls.label['controls'][index].get('size').value;
		const tempdata = this.filterColors.transform(this.colors, device, year, size);

		if (tempdata.length == 1) {
			this.labelsForm.controls.label['controls'][index].get('color').reset();
			this.labelsForm.controls.label['controls'][index].get('color').setValue(tempdata[0].name);
		} else {
			this.labelsForm.controls.label['controls'][index].get('color').reset();
		}

	}


	/******
	 * Dynamically Change form Validators
	 ******/
	setValidation(index, type, condition) {
		if (this.debug == true) {
			console.log("Set Validators for Label Type");
			console.log("Index: " + index);
			console.log("CardType: " + type);
			console.log("Condition: " + condition);
		}

		if (type == 'cpu') {
			this.computerValidation(index);
		}
		if (type == 'ipad') {
			this.ipadValidation(index);
		}
		if (type == 'iphone') {
			this.iphoneValidation(index);
		}
		if (type == 'watch') {
			this.watchValidation(index);
		}
		if (type == 'tv') {
			this.tvValidation(index);
		}
		if (type == 'other') {
			this.otherValidation(index);
		}
	}
	computerValidation(index) {
		console.log("Setting Validators for Computers");
		this.labelsForm.controls.label['controls'][index].get('device').setValidators([Validators.required]);
		this.labelsForm.controls.label['controls'][index].get('year').setValidators([Validators.required]);
		this.labelsForm.controls.label['controls'][index].get('size').setValidators([Validators.required]);
		this.labelsForm.controls.label['controls'][index].get('color').setValidators([Validators.required]);
	}
	ipadValidation(index) {
		console.log("Setting Validators for a iPads");
		this.labelsForm.controls.label['controls'][index].get("device").setValidators([Validators.required]);
	}
	iphoneValidation(index) {
		console.log("Setting Validators for a iPhones");
		this.labelsForm.controls.label['controls'][index].get('device').setValidators([Validators.required]);
	}
	watchValidation(index) {
		console.log("Setting Validators for Apple Watch");
		this.labelsForm.controls.label['controls'][index].get('device').setValidators([Validators.required]);
	}
	tvValidation(index) {
		console.log("Setting Validators for Apple TVs");
	this.labelsForm.controls.label['controls'][index].get('device').setValidators([Validators.required]);
	}
	otherValidation(index) {
		console.log("Setting Validators for Other CardTypes");
		this.labelsForm.controls.label['controls'][index].get('device').setValidators([Validators.required]);
	}

	/******
	 * Save, Load, Print functionallity for the App.
	 ******/
	save(type: string) {
		const filenameDate = new Date();
		const filename = filenameDate + `.${type}`;
		const parsedJson = JSON.stringify(this.labelsForm.value);
		const fileType = this._FileSaverService.genType(filename);
		const txtBlob = new Blob([parsedJson], { type: fileType });
		this._FileSaverService.save(txtBlob, filename);
	}

	load(): void {
		// Used to load saved json file data for saved labels.
		const dialogRef = this.dialog.open(LoadJsonComponent, {
			width: '400px',
			height: '400px;',
			data: {
				file: new FormControl(),
				saveFileData: new FormControl()
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			const parsedResult = JSON.parse(result);

			this.clearLabels();

			parsedResult.label.forEach((label, index) => {
				this.addLabel();
				this.labelsForm.controls.label['controls'][index]['controls']['cardType'].get('type').setValue(label['cardType']['type']);
				this.labelsForm.controls.label['controls'][index]['controls']['cardType'].get('viewValue').setValue(label['cardType']['viewValue']);

				// Set validators for each of the added lables from save file
				this.setValidation(
					index,
					label['cardType']['type'],
					label['condition']
				);

				this.labelsForm.controls.label['controls'][index].get('id').setValue(label['id']);
				this.labelsForm.controls.label['controls'][index].get('condition').setValue(label['condition']);
				this.labelsForm.controls.label['controls'][index].get('receivedOn').setValue(label['receivedOn']);
				this.labelsForm.controls.label['controls'][index].get('generatedOn').setValue(new Date());
				this.labelsForm.controls.label['controls'][index].get('device').setValue(label['device']);
				this.labelsForm.controls.label['controls'][index].get('year').setValue(label['year']);
				this.labelsForm.controls.label['controls'][index].get('size').setValue(label['size']);
				this.labelsForm.controls.label['controls'][index].get('price').setValue(label['price']);
				this.labelsForm.controls.label['controls'][index].get('colors').setValue(label['colors']);
				this.labelsForm.controls.label['controls'][index].get('touchbar').setValue(label['touchbar']);
			});
		});
	}

	printLabels() {
		console.log("Not Yet Implimented");
	}
}
