import { Pipe, PipeTransform } from '@angular/core';
import {
  map,
  filter,
  scan,
  startWith,
  retry,
  catchError
} from 'rxjs/operators';
import { Devices, DevicesService } from './dataservices.service';

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
@Pipe({
  name: 'FilterYears'
})
export class FilterYears implements PipeTransform {
  transform(value: any, modelToFilter: any) {
    const tempArray = [];

    value.forEach((option, index) => {
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
