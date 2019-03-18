import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: 'FilterColors'
})
export class FilterColors implements PipeTransform {
	transform(value: any, modelToFilter: any, yearToFilter: any, sizeToFilter: any, materialToFilter: any) {
		const tempArray = [];

		// console.log(value);

		value.forEach((option, indexMain) => {
			// console.log(option);

			option['models'].forEach(model => {
				const doesYearExist = model.years.includes(yearToFilter);
				const doesSizeExist = model.sizes.includes(sizeToFilter);
				const doesMaterialExist = model.materials.includes(materialToFilter);

				if (model.device === modelToFilter && doesYearExist == true && doesSizeExist == true && doesMaterialExist == true) {
					const template = {
						name: option.name
					};
					tempArray.push(template);
				}
			});
		});
		return tempArray;
	}
}
