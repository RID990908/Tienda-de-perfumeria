import * as orderService from "../src/services/orderService";
import * as orderModel from "../src/models/orderModel";
import { AppError } from "../src/lib/errorHandler";

jest.mock("../src/models/orderModel");

describe("Order Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createNewOrder", () => {
    it("debe crear una orden válida", async () => {
      const mockOrder = {
        id: 1,
        id_usuario: 1,
        total: 150.0,
        estado: "pendiente",
      };

      orderModel.createOrder.mockResolvedValue(mockOrder);

      const items = [
        { id_producto: 1, cantidad: 2, precio: 50.0 },
        { id_producto: 2, cantidad: 1, precio: 50.0 },
      ];

      const result = await orderService.createNewOrder(1, items, 150.0);

      expect(result.id).toBe(1);
      expect(result.estado).toBe("pendiente");
      expect(orderModel.createOrder).toHaveBeenCalledWith(
        1,
        items,
        150.0,
        null,
      );
    });

    it("debe rechazar usuario inválido", async () => {
      const items = [{ id_producto: 1, cantidad: 1, precio: 50.0 }];

      await expect(
        orderService.createNewOrder(null, items, 50.0),
      ).rejects.toThrow(AppError);
    });

    it("debe rechazar orden sin items", async () => {
      await expect(orderService.createNewOrder(1, [], 0)).rejects.toThrow(
        AppError,
      );
    });

    it("debe rechazar total inválido", async () => {
      const items = [{ id_producto: 1, cantidad: 1, precio: 50.0 }];

      await expect(
        orderService.createNewOrder(1, items, -50.0),
      ).rejects.toThrow(AppError);
    });
  });

  describe("updateStatus", () => {
    it("debe actualizar el estado de una orden", async () => {
      const mockOrder = {
        id: 1,
        estado: "procesando",
        updated_at: new Date(),
      };

      orderModel.updateOrderStatus.mockResolvedValue(mockOrder);

      const result = await orderService.updateStatus(1, "procesando");

      expect(result.estado).toBe("procesando");
      expect(orderModel.updateOrderStatus).toHaveBeenCalledWith(
        1,
        "procesando",
      );
    });

    it("debe rechazar estado inválido", async () => {
      await expect(orderService.updateStatus(1, "invalido")).rejects.toThrow(
        AppError,
      );
    });
  });

  describe("cancelOrderService", () => {
    it("debe cancelar una orden pendiente", async () => {
      const mockOrder = {
        id: 1,
        estado: "cancelado",
      };

      orderModel.cancelOrder.mockResolvedValue(mockOrder);

      const result = await orderService.cancelOrderService(1);

      expect(result.estado).toBe("cancelado");
      expect(orderModel.cancelOrder).toHaveBeenCalledWith(1);
    });

    it("debe rechazar orden no encontrada", async () => {
      orderModel.cancelOrder.mockRejectedValue(new Error("no encontrada"));

      await expect(orderService.cancelOrderService(999)).rejects.toThrow();
    });
  });
});
