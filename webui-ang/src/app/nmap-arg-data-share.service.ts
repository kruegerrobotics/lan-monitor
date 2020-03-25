import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export class NmapArgs {
  public ipRange: string
  public parameters: string
  public scaninterval : number

  constructor(){
    this.ipRange = "undefined"
    this.parameters = "undefined"  
    this.scaninterval = NaN
  }

}

@Injectable()
export class NmapArgDataShareService {

  mInit: NmapArgs = new NmapArgs()

  private message = new BehaviorSubject(this.mInit);
  sharedMessage = this.message.asObservable();

  constructor() { }

  changeMessage(message: NmapArgs) {
    this.message.next(message)
  }
}
