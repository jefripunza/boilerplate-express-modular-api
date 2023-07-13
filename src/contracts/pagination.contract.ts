export enum OrderByEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type OrderByType = 'ASC' | 'DESC';

export interface IPaginationRequest {
  page?: string;
  perPage?: string;
  sort?: string;
  order?: OrderByType;
  search?: string;
}
