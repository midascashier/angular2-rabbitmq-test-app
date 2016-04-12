export class StorageInnerObject {

  singleString:string;
  singleNumber:number;

  constructor(singleString:string, singleNumber:number) {
    this.singleString = singleString;
    this.singleNumber = singleNumber;
  }

  printObj() {
    console.log("Inner Object " + this.singleString);
    console.log("Inner Object " + this.singleNumber);
  }

  revive(data:any) {
    return new StorageInnerObject(data.singleString, data.singleNumber);
  }

  toJSON() {
    return {
      __type: 'StorageInnerObject',
      singleString: this.singleString,
      singleNumber: this.singleNumber
    };
  }
}
// We should not do this, find another way to register this object globally so it can be referenced.
//window.StorageInnerObject = new StorageInnerObject('', 1);