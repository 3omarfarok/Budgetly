import api from "../../../utils/api";
import { buildInventoryListRequestParams } from "./inventoryFilters";

const assertInventoryHouseId = (houseId) => {
  if (!houseId) {
    throw new Error("Inventory houseId is required");
  }

  return houseId;
};

export const inventoryApi = {
  getItems: async ({ houseId, filters = {} } = {}) => {
    assertInventoryHouseId(houseId);

    const { data } = await api.get("/inventory", {
      params: buildInventoryListRequestParams(filters),
    });

    return data;
  },

  getSummary: async ({ houseId } = {}) => {
    assertInventoryHouseId(houseId);

    const { data } = await api.get("/inventory/summary");
    return data;
  },

  createItem: async ({ houseId, ...payload }) => {
    assertInventoryHouseId(houseId);

    const { data } = await api.post("/inventory", payload);
    return data;
  },

  updateItem: async ({ houseId, id, ...payload }) => {
    assertInventoryHouseId(houseId);

    const { data } = await api.patch(`/inventory/${id}`, payload);
    return data;
  },

  adjustItem: async ({ houseId, id, ...payload }) => {
    assertInventoryHouseId(houseId);

    const { data } = await api.patch(`/inventory/${id}/adjust`, payload);
    return data;
  },

  deleteItem: async ({ houseId, id }) => {
    assertInventoryHouseId(houseId);

    const { data } = await api.delete(`/inventory/${id}`);
    return data;
  },
};
