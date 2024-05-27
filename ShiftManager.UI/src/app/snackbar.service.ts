import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor (
    private _snackbar: MatSnackBar
  ) {}

  public openSnackbar(message: string) {
    this._snackbar.open(message, undefined, {
      verticalPosition: 'top',
      duration: 2000
    })
  }

}