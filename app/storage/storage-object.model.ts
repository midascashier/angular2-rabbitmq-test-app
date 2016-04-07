import { StorageInnerObject } from './storage-inner-object.model';

export class StorageObject {

  singleString:string;
  singleNumber:number;
  singleObject:StorageInnerObject;

  arrayString:string[];
  arrayNumber:number[];
  arrayObj:StorageInnerObject[];

  printSingle() {
    console.log("Outer String " + this.singleString);
    console.log("Outer Number " + this.singleNumber);
    console.log("Outer Object:");
    this.singleObject.printObj();
  }

  printArray() {
    this.arrayString.forEach((item) => {
      console.log("Inner Array String " + item);
    });
    this.arrayNumber.forEach((item) => {
      console.log("Inner Array Number " + item);
    });

    /*
    this.arrayObj.forEach((item) => {
      console.log("Inner Array Object: ");
      item.printObj();
    });
    */
  }

  revive(data) {
    let obj = new StorageObject();

    obj.singleString = data.singleString;
    obj.singleNumber = data.singleNumber;
    obj.singleObject = JSON.parse(data.singleObject, function (key, value) {
      if (key === '' && value.hasOwnProperty('__type')) {

        if (value.__type == "StorageObject") {
          let obj:StorageObject = window[value.__type];
          return obj.revive(value);
        } else if (value.__type == "StorageInnerObject") {
          let obj:StorageInnerObject = window[value.__type];
          return obj.revive(value);
        } else {
          // Add new objects here.
          return this[key];
        }
      } else {
        return this[key];
      }
    });

    obj.arrayString = data.arrayString;
    obj.arrayNumber = data.arrayNumber;

    //let arrayObj:StorageInnerObject[] = [];
    //for (let i = 0; i < data.arrayObj.length; i++) {
    /*obj.arrayObj = JSON.parse(data.arrayObject, function (key, value) {
      if (key === '' && value.hasOwnProperty('__type')) {
        if (value.__type == "StorageObject") {
          let obj:StorageObject = window[value.__type];
          return obj.revive(value);
        } else if (value.__type == "StorageInnerObject") {
          let obj:StorageInnerObject = window[value.__type];
          return obj.revive(value);
        } else {
          // Add new objects here.
          return this[key];
        }
      } else {
        return this[key];
      }
    });
    //}
    //obj.arrayObj = arrayObj;
    */
    return obj;
  }

  toJSON() {
    return {
      __type: 'StorageObject',
      singleString: this.singleString,
      singleNumber: this.singleNumber,
      singleObject: JSON.stringify(this.singleObject),

      arrayString: this.arrayString,
      arrayNumber: this.arrayNumber,
      arrayObject: JSON.stringify(this.arrayObj),
    };
  }
}
// We should not do this, find another way to register this object globally so it can be referenced.
window.StorageObject = new StorageObject();