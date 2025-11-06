export interface IContractTemplate {
  _id: string;
  buildingId: string;
  ownerId: string;
  name: string;
  basePdfUrl: string;
  defaultTermIds: string[];
  defaultRegulationIds: string[];
  placeholders: {
    termsTagField: string;
    regulationsTagField: string;
  };
  status: "active" | "inactive";
  fields: ContractField[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ContractField {
  pdfField: string;
  key: string;
  type: "text" | "number" | "date" | string;
  required: boolean;
}

export interface IContractTemplateRequest {
  name: string;
  defaultTermIds: string[];
  defaultRegulationIds: string[];
  placeholders: {
    termsTagField: string;
    regulationsTagField: string;
  };
}

export interface IContractTemplateCreateRequest
  extends IContractTemplateRequest {
  buildingId: string;
}

export interface IContractTemplateUpdateRequest
  extends IContractTemplateRequest {
  status: "active" | "inactive";
}

export interface IPreviewPdfRequest {
  buildingId: string;
  termIds: string[];
  regulationIds: string[];
}

export type IContractTemplateResponse = IContractTemplate[];
