import { Component } from 'angular2/core';
import { FORM_DIRECTIVES } from 'angular2/common';

import { StorageObject } from './storage-object.model';
import { StorageInnerObject } from './storage-inner-object.model';

@Component({
  selector: 'storage',
  templateUrl: 'app/storage/storage.component.html'
})

export class StorageComponent {

  displayObject:StorageObject;

  save() {

    let storageObject = new StorageObject();
    storageObject.singleString = "ZZ";
    storageObject.singleNumber = 99;
    storageObject.singleObject = new StorageInnerObject("a", 1);

    storageObject.arrayString = ['a', 'b', 'c', 'd'];
    storageObject.arrayNumber = [1, 2, 3, 4];

    storageObject.arrayObj = [];
    for (let i = 0; i < 5; i++) {
      let storageInnerObject = new StorageInnerObject("a" + i, i);
      storageObject.arrayObj.push(storageInnerObject);
    }

    let jsonObject = JSON.stringify(storageObject);

    sessionStorage.setItem("sessionObject", jsonObject);
  }

  restoreAndUse() {
    let storageObject = sessionStorage.getItem("sessionObject");
    if (storageObject) {

      let restoredObject = JSON.parse(storageObject, function (key, value) {
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
      this.displayObject = restoredObject;

      if (restoredObject) {    // This methods will not exist until the problem above is fixed.
        restoredObject.printSingle();
        restoredObject.printArray();
      }

    } else {
      console.log("Nothing to restore");
    }
  }
}