import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';

// Define Devices data structure
export interface Devices {
     "device"    : string,
     "name"      : string,
     "basePrice" : number,
     "year"      : string,
     "size"      : string,
     "touchbar"  : string
}

// Get Data from either local or remote
@Injectable()
export class DevicesService {

     localDevices = 'assets/devices.json';
     localPrices = 'assets/prices.json';
     localCondition = 'assets/DeviceTypeOptions.json';
     localCardTypes = 'assets/cardtypes.json';
     remoteDevices = 'https://raw.githubusercontent.com/Tschuky101/SM-Inventory-Labels/master/inventory-labels/src/assets/devices.json';
     remotePrices = 'https://raw.githubusercontent.com/Tschuky101/SM-Inventory-Labels/master/inventory-labels/src/assets/prices.json';
     remoteCondition = 'https://raw.githubusercontent.com/Tschuky101/SM-Inventory-Labels/master/inventory-labels/src/assets/DeviceTypeOptions.json';
     remoteCardTypes = 'https://raw.githubusercontent.com/Tschuky101/SM-Inventory-Labels/master/inventory-labels/src/assets/cardtypes.json';

     constructor(private http: HttpClient) { }

     devices: '';

     getDevices(local){
          console.log("Getting Devices");
          if(local == true){
               return this.http.get(this.localDevices, {responseType: 'json'});

          } else {
               console.log("Loading Devices from Remote");
               return this.http.get(this.remoteDevices).pipe(
                    retry(3)
               );
          }
     }
     getPrices(local){
          console.log("Getting Prices");
          if(local == true){
               return this.http.get(this.localPrices, {responseType: 'json'});

          } else {
               console.log("Loading Prices from Remote");
               return this.http.get(this.remotePrices).pipe(
                    retry(3)
               );
          }
     }
     getCondition(local){
          console.log("Getting Condition Types");
          if(local == true){
               return this.http.get(this.localCondition, {responseType: 'json'});

          } else {
               console.log("Loading Prices from Remote");
               return this.http.get(this.remoteCondition).pipe(
                    retry(3)
               );
          }
     }
     getCardTypes(local){
          console.log("Getting Card Types");
          if(local == true){
               return this.http.get(this.localCardTypes, {responseType: 'json'});

          } else {
               console.log("Loading Card Types from Remote");
               return this.http.get(this.remoteCardTypes).pipe(
                    retry(3)
               );
          }
     }

     private handleError(){
          console.log("Error");
     }
}
