export interface TAttachmentSubDocument {
  key: string;
  name: string;
}

export interface TItem {
  itemId: string;
  userId: string;
  name: string;
  date: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  attachments: TAttachmentSubDocument[];
}
