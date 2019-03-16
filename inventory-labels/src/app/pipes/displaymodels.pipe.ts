import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'DisplayModels'
})
export class DisplayModels implements PipeTransform {
	transform(value: any, type: any) {
		const tempArray = [];

		value.forEach((option, index) => {
			if (value[index].device == type) {
				const template = {
					name: value[index].name,
					device: value[index].device
				};
				tempArray.push(template);
			}
		});

		return tempArray;
	}
}
