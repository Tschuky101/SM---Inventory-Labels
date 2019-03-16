import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'FilterSizes'
})
export class FilterSizes implements PipeTransform {
	transform(value: any, modelToFilter: any, yearToFilter: any) {
		const tempArray = [];

		// console.log("Value to be Filltered");
		// console.log(value);
		// console.log("Model to Filter to: "+modelToFilter);
		// console.log("Year to Filter to: "+yearToFilter);

		value.forEach(option => {
			const currentYear = yearToFilter;
			const currentDevice = modelToFilter;

			// console.log("Current Device & Year: " + currentDevice + " ("+currentYear+")");
			// console.log("Option Currently Being looked at:");
			// console.log(option);

			for (let i = 0; i < option.models.length; i++) {
				if (currentDevice == option.models[i]) {
					for (let j = 0; j < option.years.length; j++) {
						if (currentYear == option.years[j]) {
							const template = {
								size: option.size
							};
							tempArray.push(template);
						}
					}
				}
			}
		});

		return tempArray;
	}
}
