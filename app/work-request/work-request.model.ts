export class WorkRequest {

  status:string;

  module:string;
  f:string;

  request:string;

  response:string;

  constructor(module:string, f:string) {
    this.module = module;
    this.f = f;
    this.status = "Pending";
  }
}