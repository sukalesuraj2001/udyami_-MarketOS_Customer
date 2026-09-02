import { TestBed } from '@angular/core/testing';

import { AICalenders } from './aicalenders';

describe('AICalenders', () => {
  let service: AICalenders;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AICalenders);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
