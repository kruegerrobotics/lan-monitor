import { TestBed } from '@angular/core/testing';

import { NmapArgDataShareService } from './nmap-arg-data-share.service';

describe('NmapArgDataShareService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NmapArgDataShareService = TestBed.get(NmapArgDataShareService);
    expect(service).toBeTruthy();
  });
});
