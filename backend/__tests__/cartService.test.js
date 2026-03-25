import * as cartService from "../src/services/cartService";
import * as cartModel from "../src/models/cartModel";
import { AppError } from "../src/lib/errorHandler";

jest.mock("../src/models/cartModel");

describe("Cart Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addItemToCart", () => {
    it("debe agregar un item válido al carrito", async () => {
      const mockItem = {
        id: 1,
        id_producto: 5,
        cantidad: 2,
      };

      cartModel.addToCart.mockResolvedValue(mockItem);

      const result = await cartService.addItemToCart(5, 2);

      expect(result.id_producto).toBe(5);
      expect(result.cantidad).toBe(2);
      expect(cartModel.addToCart).toHaveBeenCalledWith(5, 2);
    });

    it("debe rechazar id_producto faltante", async () => {
      await expect(cartService.addItemToCart(null, 2)).rejects.toThrow(
        AppError,
      );
    });

    it("debe rechazar cantidad <= 0", async () => {
      await expect(cartService.addItemToCart(5, 0)).rejects.toThrow(AppError);
    });

    it("debe rechazar cantidad > 100", async () => {
      await expect(cartService.addItemToCart(5, 101)).rejects.toThrow(AppError);
    });

    it("debe manejar error de stock insuficiente", async () => {
      cartModel.addToCart.mockRejectedValue(
        new Error("Stock insuficiente. Disponible: 5, Solicitado: 10"),
      );

      await expect(cartService.addItemToCart(5, 10)).rejects.toThrow();
    });
  });

  describe("removeItemFromCart", () => {
    it("debe eliminar un item del carrito", async () => {
      const mockItem = {
        id: 1,
        id_producto: 5,
        cantidad: 2,
      };

      cartModel.removeFromCart.mockResolvedValue(mockItem);

      const result = await cartService.removeItemFromCart(1);

      expect(result.id_producto).toBe(5);
      expect(cartModel.removeFromCart).toHaveBeenCalledWith(1);
    });

    it("debe rechazar id_carrito inválido", async () => {
      await expect(cartService.removeItemFromCart(null)).rejects.toThrow(
        AppError,
      );
    });

    it("debe manejar item no encontrado", async () => {
      cartModel.removeFromCart.mockRejectedValue(
        new Error("Item no encontrado"),
      );

      await expect(cartService.removeItemFromCart(999)).rejects.toThrow();
    });
  });

  describe("listCartItems", () => {
    it("debe obtener items del carrito", async () => {
      const mockItems = [
        {
          id_carrito: 1,
          cantidad: 2,
          id_producto: 5,
          nombre: "Producto",
          precio: 50,
        },
        {
          id_carrito: 2,
          cantidad: 1,
          id_producto: 10,
          nombre: "Otro",
          precio: 100,
        },
      ];

      const mockTotal = {
        num_items: 2,
        total_cantidad: 3,
        total_general: 200,
        impuesto_estimado: 32,
      };

      cartModel.getCart.mockResolvedValue(mockItems);
      cartModel.getCartTotal.mockResolvedValue(mockTotal);

      const result = await cartService.listCartItems();

      expect(result.items).toHaveLength(2);
      expect(result.summary.total_general).toBe(200);
    });
  });
});
