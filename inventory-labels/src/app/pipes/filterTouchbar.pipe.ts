import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "FilterTouchbar"
})
export class FilterTouchbar implements PipeTransform {
	transform(value: any, modelToFilter: any, yearToFilter: any, sizeToFilter) {
		const tempArray = [];

		// console.log("Touchbar Filter");

		value.forEach(element => {
			const doesDeviceExist = element.devices.findIndex(item => item.name === modelToFilter);

			if (doesDeviceExist > -1) {
				if (element.value === false) {
					// console.log("Current Touchbar value to be looked at is False");

					element.devices.forEach((element2, index) => {
						// const size = element2.sizes.includes(sizeToFilter);

						if (element2.name === modelToFilter) {

							element2['years'].forEach((year, index2) => {
								// console.log(year);
								if (year.year === yearToFilter) {
									const doesSizeExist = year['sizes'].includes(sizeToFilter);

									if (doesSizeExist === true) {
										const template = {
											value: false
										};
										tempArray.push(template);
									}
								}
							});
						}
					});
				}
				if (element.value === true) {
					// console.log("Current Touchbar value to be looked at is True");

					element.devices.forEach((element2, index) => {
						// const size = element2.sizes.includes(sizeToFilter);
						// console.log(element2);
						if (element2.name === modelToFilter) {

							element2['years'].forEach((year, index2) => {
								// console.log(year);
								if (year.year === yearToFilter) {
									const doesSizeExist = year['sizes'].includes(sizeToFilter);

									if (doesSizeExist === true) {
										const template = {
											value: true
										};
										tempArray.push(template);
									}
								}
							});
						}
					});
				}
			}
		});
		return tempArray;
	}

}
