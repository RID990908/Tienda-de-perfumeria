import { handleError, handleSuccess } from "../../../../lib/errorHandler";
import * as cartController from "../../../../features/cart/controllers/cartController";

export async function GET() {
  try {
    const cart = await cartController.browseCart();
    return handleSuccess(cart, 200);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req) {
  try {
    const newItem = await cartController.addItem(req);
    return handleSuccess(newItem, 201, "Producto aÃ±adido al carrito");
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req) {
  try {
    const deletedItem = await cartController.removeItem(req);
    return handleSuccess(
      deletedItem,
      200,
      "Producto eliminado del carrito",
    );
  } catch (error) {
    return handleError(error);
  }
}
