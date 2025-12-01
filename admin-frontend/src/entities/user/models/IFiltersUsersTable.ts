export interface IFiltersUsersTable {
    search?: string;
    roles?: string;
    banned?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: string;
}