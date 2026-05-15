/** Certificate staff modal: approve, reject, or append remarks (re-auth + optional text). */
export type StaffCertificateDialogIntent = 'approve' | 'reject' | 'remark';

export interface StaffCertificateDialogUi {
  titleKey: string;
  remarksBodyLabelKey: string;
  remarksHintKey: string;
  remarksRows: number;
  submitLabelKey: string;
  submitVariant: 'primary' | 'danger';
  textareaName: string;
}

export const STAFF_CERTIFICATE_DIALOG_UI: Record<StaffCertificateDialogIntent, StaffCertificateDialogUi> = {
  approve: {
    titleKey: 'ADMIN_HOME.PENDING_CERT_DIALOG_TITLE',
    remarksBodyLabelKey: 'ADMIN_CERT_APP_DETAIL.APPROVE_REMARKS_LABEL',
    remarksHintKey: 'ADMIN_CERT_APP_DETAIL.APPROVE_REMARKS_HINT',
    remarksRows: 3,
    submitLabelKey: 'ADMIN_HOME.PENDING_CERT_CONFIRM',
    submitVariant: 'primary',
    textareaName: 'staffCertApproveRemarks'
  },
  reject: {
    titleKey: 'ADMIN_CERT_APP_DETAIL.DIALOG_REJECT_TITLE',
    remarksBodyLabelKey: 'ADMIN_CERT_APP_DETAIL.REJECT_REMARKS_LABEL',
    remarksHintKey: 'ADMIN_CERT_APP_DETAIL.REJECT_REMARKS_HINT',
    remarksRows: 3,
    submitLabelKey: 'ADMIN_CERT_APP_DETAIL.REJECT',
    submitVariant: 'danger',
    textareaName: 'staffCertRejectRemarks'
  },
  remark: {
    titleKey: 'ADMIN_CERT_APP_DETAIL.DIALOG_REMARKS_ONLY_TITLE',
    remarksBodyLabelKey: 'ADMIN_CERT_APP_DETAIL.APPEND_REMARKS_BODY',
    remarksHintKey: 'ADMIN_CERT_APP_DETAIL.APPEND_REMARKS_HINT',
    remarksRows: 4,
    submitLabelKey: 'ADMIN_CERT_APP_DETAIL.APPEND_REMARKS_SAVE',
    submitVariant: 'primary',
    textareaName: 'staffCertRemarkOnlyBody'
  }
};
