import { ActorKey, UserSubRole } from '../types';

export interface PermissionCheck {
  canUploadDoc: boolean;
  canReviewDoc: boolean;
  canVisaDoc: boolean;
  canPublishDoc: boolean;
  canRequestNo: boolean;
  canDecideNo: boolean;
  canCertifyIpc: boolean;
  canApprovePayIpc: boolean;
  canSubmitIpc: boolean;
  canDeclareIncident: boolean;
  canNotifyDonorIncident: boolean;
  canCreateNcr: boolean;
  canCloseNcr: boolean;
  canManagePar: boolean;
  canManageGrievance: boolean;
  canAccessVbgRestricted: boolean;
  canGenerateReport: boolean;
  canValidateReport: boolean;
  canTransmitDonorReport: boolean;
  canAccessAuditAdmin: boolean;
}

export function getActorPermissions(actor: ActorKey, subRole: UserSubRole): PermissionCheck {
  return {
    canUploadDoc: actor === 'mo' || actor === 'entreprise' || actor === 'amo' || actor === 'moe',
    canReviewDoc: true,
    canVisaDoc: actor === 'moe' || (actor === 'mo' && subRole === 'mo_chef'),
    canPublishDoc: actor === 'mo' && (subRole === 'mo_chef' || subRole === 'admin'),
    canRequestNo: actor === 'mo' && (subRole === 'mo_chef' || subRole === 'admin'),
    canDecideNo: actor === 'bailleur',
    canCertifyIpc: actor === 'moe',
    canApprovePayIpc: actor === 'mo' && (subRole === 'mo_chef' || subRole === 'admin'),
    canSubmitIpc: actor === 'entreprise',
    canDeclareIncident: true,
    canNotifyDonorIncident: actor === 'mo' && (subRole === 'mo_chef' || subRole === 'admin'),
    canCreateNcr: actor === 'moe',
    canCloseNcr: actor === 'moe',
    canManagePar: actor === 'mo' && (subRole === 'mo_foncier' || subRole === 'mo_chef' || subRole === 'admin'),
    canManageGrievance: actor === 'mo' && (subRole === 'mo_grm' || subRole === 'admin'),
    canAccessVbgRestricted: subRole === 'mo_grm',
    canGenerateReport: true,
    canValidateReport: (actor === 'mo' && subRole === 'mo_chef') || (actor === 'moe' && subRole === 'moe_chef'),
    canTransmitDonorReport: actor === 'mo' && (subRole === 'mo_chef' || subRole === 'admin'),
    canAccessAuditAdmin: subRole === 'admin',
  };
}
