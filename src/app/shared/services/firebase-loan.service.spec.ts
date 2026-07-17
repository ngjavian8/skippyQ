import { TestBed } from '@angular/core/testing';

import { FirebaseLoan } from './firebase-loan.service';

describe('FirebaseLoan', () => {
  let service: FirebaseLoan;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseLoan);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
