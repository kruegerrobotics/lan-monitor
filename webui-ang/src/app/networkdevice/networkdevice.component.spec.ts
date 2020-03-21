import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkdeviceComponent } from './networkdevice.component';

describe('NetworkdeviceComponent', () => {
  let component: NetworkdeviceComponent;
  let fixture: ComponentFixture<NetworkdeviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkdeviceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkdeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
