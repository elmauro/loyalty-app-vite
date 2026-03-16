export interface ColombiaCity {
  id: number;
  name: string;
}

export interface ColombiaDepartment {
  id: number;
  name: string;
  cities: ColombiaCity[];
}

export const colombiaDepartments: ColombiaDepartment[];
export const allCities: (ColombiaCity & { departmentName: string })[];
export function getCityById(cityId: number | string | null | undefined): (ColombiaCity & { departmentName: string }) | undefined;
