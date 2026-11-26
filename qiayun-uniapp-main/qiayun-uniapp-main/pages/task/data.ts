export interface selectedTemplateItems {
  templateId?: number;
  tempList: {
    id: string;
    name: string;
    items: {
      id: string;
      name: string;
      operationItems: operationItems[];
    }[];
  }[];
}

export interface operationItems {
  id: string;
  name: string;
  sort: number;
  type: string; // SELECT , TEXT , BOOLEAN
  options: string[];
  required: boolean;
  bindInspectionId: string;
}
