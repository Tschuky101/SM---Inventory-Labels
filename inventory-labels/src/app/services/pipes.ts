import { Pipe, PipeTransform, } from '@angular/core';
import { map, filter, scan, startWith, retry, catchError } from 'rxjs/operators';
import { Devices, DevicesService} from './dataservices.service'

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

@Pipe({
     name: 'FilterSizes'
})
export class FilterSizes {
     transform(value: any, modelToFilter: any, yearToFilter: any){
          
          var tempArray = [];

          // console.log("Value to be Filltered");
          // console.log(value);
          // console.log("Model to Filter to: "+modelToFilter);
          // console.log("Year to Filter to: "+yearToFilter);

          value.forEach(option =>{

               let currentYear = yearToFilter;
               let currentDevice = modelToFilter;

               // console.log("Current Device & Year: " + currentDevice + " ("+currentYear+")");
               // console.log("Option Currently Being looked at:");
               // console.log(option);

               for(let i=0; i<option.models.length; i++){

                    if(currentDevice == option.models[i]){

                         for(let j=0; j<option.years.length; j++){
                              if(currentYear == option.years[j]){

                                   let template = {
                                        "size":option.size,
                                   }
                                   tempArray.push(template);
                              }
                         }
                    }
               }

          });

          return tempArray;

     }
}
