export class WorkRequest {
  // Id of the work request, will be used for tracking. 
  id:number

  status:string;

  module:string;
  f:string;

  request:any;

  response:any;

  constructor(module:string, f:string) {
    this.module = module;
    this.f = f;
    this.status = "PENDING";
  }
}