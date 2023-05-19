import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageHeaderComponent } from '@components/page-header.component';
import { StorageService } from '@services/storage.service';

@Component({
  selector: 'app-settings-index',
  template: `
<app-page-header>
  <mat-icon matListItemIcon aria-hidden="true" fontIcon="settings"></mat-icon>
  <span matListItemTitle> Settings </span>
</app-page-header>

<section class="storage">
  <h2>
    <mat-icon matListItemIcon aria-hidden="true" fontIcon="storage"></mat-icon>
    Storage
  </h2>

  <p>
    Delete data stored in your browser by this application. This will reset behavior and settings to their default values.
  </p>

  <form (submit)="onSubmitStorage($event)">
    <ul *ngIf="keys.size">
      <li *ngFor="let key of keys; trackBy:trackByKey">
        <mat-checkbox [name]="key">
          {{ key }}
        </mat-checkbox>
      </li>
    </ul>

    <div class="actions">
      <button mat-stroked-button type="reset">Reset</button>
      <button mat-flat-button color="warn" type="submit">Clear</button>
    </div>
  </form>
</section>
  `,
  styles: [`
h2 {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.storage .search {
  margin-top: 1rem;
}

.storage ul {
  list-style-type: none;
  padding: 0.5rem;
  margin: 0;

  display: grid;
  grid-template-columns: min-content min-content min-content;
  column-gap: 0.5rem;
}

.storage .actions {
  margin-top: 0.75rem;

  display: flex;
  flex-direction: row;
  gap: 1rem;
}
  `],
  standalone: true,
  providers: [
    StorageService
  ],
  imports: [
    NgFor,
    NgIf,
    PageHeaderComponent,
    MatIconModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule
  ]
})
export class IndexComponent implements OnInit {
  keys: Set<string>;

  constructor(
    private _storageService: StorageService,
  ) {}

  ngOnInit(): void {
    this.keys = this.#sortKeys(this._storageService.keys);
  }

  onSubmitStorage(event: SubmitEvent): void {
    event.preventDefault();

    const form = event.target as HTMLFormElement;

    if (!form) {
      return;
    }

    const checkboxes = form.querySelectorAll('input[type="checkbox"]');

    const checkboxesArray = Array.from(checkboxes) as HTMLInputElement[];
    const keys = [];

    for (const checkbox of checkboxesArray) {
      if (checkbox.checked) {
        keys.push(checkbox.name);
      }
    }

    for (const key of keys) {
      this.keys.delete(key);
      this._storageService.removeItem(key);
    }
  }

  trackByKey(index: number, key: string): string {
    return key;
  }

  #sortKeys(keys: Set<string>): Set<string> {
    const keysArray = Array.from(keys);
    const sortedKeys = keysArray.sort();

    return new Set(sortedKeys);
  }
}