import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  DAKHALA_TYPES,
  DakhalaTypeItem,
  isDakhalaHeader
} from './dakhale-types.data';

@Component({
  selector: 'app-dakhale',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './dakhale.component.html',
  styleUrls: ['./dakhale.component.scss']
})
export class DakhaleComponent {
  readonly rows = DAKHALA_TYPES;
  readonly isDakhalaHeader = isDakhalaHeader;

  applyOpen = false;
  complaintOpen = false;
  suchanaOpen = false;
  selected: DakhalaTypeItem | null = null;

  applyForm = {
    name: '',
    phone: '',
    purpose: '',
    address: ''
  };

  complaintForm = {
    name: '',
    phone: '',
    subject: '',
    location: '',
    details: ''
  };

  suchanaForm = {
    name: '',
    phone: '',
    category: '',
    details: '',
    benefit: ''
  };

  submitMessage: string | null = null;

  readonly applyPurposeKeys = [
    'DAKHALE.PURPOSE.GOVERNMENT',
    'DAKHALE.PURPOSE.BANK',
    'DAKHALE.PURPOSE.SCHOOL',
    'DAKHALE.PURPOSE.SCHOLARSHIP',
    'DAKHALE.PURPOSE.PERSONAL',
    'DAKHALE.PURPOSE.COURT',
    'DAKHALE.PURPOSE.OTHER'
  ];

  readonly complaintSubjectKeys = [
    'DAKHALE.COMPLAINT_SUBJ.ROAD',
    'DAKHALE.COMPLAINT_SUBJ.WATER',
    'DAKHALE.COMPLAINT_SUBJ.SANITATION',
    'DAKHALE.COMPLAINT_SUBJ.STREETLIGHT',
    'DAKHALE.COMPLAINT_SUBJ.DRAIN',
    'DAKHALE.COMPLAINT_SUBJ.PROPERTY_DAMAGE',
    'DAKHALE.COMPLAINT_SUBJ.UNAUTH_BUILD',
    'DAKHALE.COMPLAINT_SUBJ.CORRUPTION',
    'DAKHALE.COMPLAINT_SUBJ.OTHER'
  ];

  readonly suchanaCategoryKeys = [
    'DAKHALE.SUCHANA_CAT.DEV_PLAN',
    'DAKHALE.SUCHANA_CAT.WATER_IMPROVE',
    'DAKHALE.SUCHANA_CAT.ENV_TREE',
    'DAKHALE.SUCHANA_CAT.HEALTH',
    'DAKHALE.SUCHANA_CAT.EDUCATION',
    'DAKHALE.SUCHANA_CAT.POWER_LIGHT',
    'DAKHALE.SUCHANA_CAT.FARM_IRRIG',
    'DAKHALE.SUCHANA_CAT.WOMEN_CHILD',
    'DAKHALE.SUCHANA_CAT.SPORTS',
    'DAKHALE.SUCHANA_CAT.OTHER'
  ];

  openRow(row: (typeof DAKHALA_TYPES)[number]) {
    if (isDakhalaHeader(row)) return;
    this.submitMessage = null;
    if (row.isComplaint) {
      this.complaintOpen = true;
      return;
    }
    this.selected = row;
    this.applyOpen = true;
  }

  closeApply() {
    this.applyOpen = false;
    this.selected = null;
  }

  closeComplaint() {
    this.complaintOpen = false;
  }

  closeSuchana() {
    this.suchanaOpen = false;
  }

  openSuchana() {
    this.submitMessage = null;
    this.suchanaOpen = true;
  }

  submitApplyStub() {
    this.submitMessage = 'DAKHALE.STUB_APPLY_ACK';
    this.closeApply();
  }

  submitComplaintStub() {
    this.submitMessage = 'DAKHALE.STUB_COMPLAINT_ACK';
    this.closeComplaint();
  }

  submitSuchanaStub() {
    this.submitMessage = 'DAKHALE.STUB_SUCHANA_ACK';
    this.closeSuchana();
  }
}
