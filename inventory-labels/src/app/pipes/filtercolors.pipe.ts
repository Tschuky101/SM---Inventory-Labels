import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: 'FilterColors'
})
export class FilterColors implements PipeTransform {
	transform(value: any, modelToFilter: any, yearToFilter: any, sizeToFilter: any) {
		const tempArray = [];

		value.forEach((option, indexMain) => {
			// console.log(option);

			if (modelToFilter != null && yearToFilter != null && sizeToFilter != null) {
				console.log("All Variables are filled");
				console.log("Device: " + modelToFilter);
				console.log("Year: " + yearToFilter);
				console.log("Size: " + sizeToFilter);
			}

			for (let i = 0; i < option.models.length; i++) {

				if (modelToFilter == option.models[i]) {
					console.log("Devices exists in color: " + option.name + "'s array");
					for (let j = 0; j < option.years.length; j++) {
						if (yearToFilter == option.years[j]) {
							console.log("Device: " + modelToFilter + " year of: " + yearToFilter + " exists on color: " + option.name + "'s array");
							for (let k = 0; k < option.sizes.length; k++) {
								if (sizeToFilter == option.sizes[k]) {
									console.log("Device " + sizeToFilter + " size of: " + sizeToFilter + " exists on color: " + option.name + "'s array");

									const template = {
										name: option.name
									};

									tempArray.push(template);
								}
							}
						}
					}
				}

			}
		});
		console.log(tempArray);
		return tempArray;
	}
}
