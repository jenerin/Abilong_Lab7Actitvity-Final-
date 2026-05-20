import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Alert, AlertType, AlertOptions } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private subject = new Subject<Alert>();
  private defaultId = 'default-alert';

  onAlert(id = this.defaultId): Observable<Alert> {
    return this.subject.asObservable().pipe(filter((x) => x && x.id === id));
  }

  success(message: string, options?: AlertOptions): void {
    this.alert(new Alert({ ...options, type: AlertType.Success, message }));
  }

  error(message: string, options?: AlertOptions): void {
    this.alert(new Alert({ ...options, type: AlertType.Error, message }));
  }

  info(message: string, options?: AlertOptions): void {
    this.alert(new Alert({ autoClose: false, keepAfterRouteChange: true, ...options, type: AlertType.Info, message }));
  }

  warn(message: string, options?: AlertOptions): void {
    this.alert(new Alert({ ...options, type: AlertType.Warning, message }));
  }

  alert(alert: Alert): void {
    alert.id = alert.id || this.defaultId;
    alert.autoClose =
      alert.autoClose === undefined ? true : alert.autoClose;
    this.subject.next(alert);

    // Auto-close the alert if autoClose is true
    if (alert.autoClose) {
      setTimeout(() => this.clear(alert.id), 3000);
    }
  }

  clear(id = this.defaultId): void {
    this.subject.next(new Alert({ id }));
  }
}
