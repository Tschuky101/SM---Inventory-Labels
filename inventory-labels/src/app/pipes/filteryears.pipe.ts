import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'FilterYears'
})
export class FilterYears implements PipeTransform {
	transform(value: any, modelToFilter: any) {
		const tempArray = [];

		value.forEach((option) => {
			const currentYear = option.year;

			option['models'].forEach(model => {
				if (model == modelToFilter) {
					const template = {
						year: currentYear
					};

					tempArray.push(template);
				}
			});
		});

		return tempArray;
	}
}
